import React from 'react'
import ReactDOMServer from 'react-dom/server'
import PropTypes from 'prop-types'
import {get} from 'lodash'
import className from 'classnames'
import axios from 'axios'
import * as d3 from 'd3'

const Index = (props) => {
  const $svg = React.useRef()
  const $mainG = React.useRef()

  const ___nodes = React.useRef([
    {
      fx: 800 / 2,
      fy: 400 / 2,
      type: 'center',
      title: '阪神 0 - 0 巨人',
    },
    {
      x: 800 / 2,
      y: 400 / 2,
      title: 'Panes of glass',
      comments: [{}],
    },
  ])

  const ___simulation = React.useRef()
  const ___animate = React.useRef()

  React.useEffect(() => {
    const $$svg = d3.select($svg.current)
    const $$mainG = d3.select($mainG.current)
    const radius = 30

    let $$gs
    let $$gsBg
    let $$gsDefs
    let $$gsDefsPattern
    let $$gsDefsPatternImage
    let $$gsCover
    let $$gsTitle
    let $$gsCommentsWrapper
    let $$gsComments
    let $$gsCommentsLine

    // START zoom

    $$svg.call(
      d3
        .zoom()
        .extent([
          [0, 0],
          [800, 400],
        ])
        .scaleExtent([1 / (2 * 1), 2 * 4])
        .translateExtent([
          [-100, -100],
          [800 + 100, 400 + 100],
        ])
        .on('zoom', () => {
          $$mainG.attr('transform', d3.event.transform)
        })
    )

    $$svg.on('dblclick.zoom', null)

    // END zoom

    $$gs = $$mainG.selectAll('g.post')

    ___simulation.current = d3
      .forceSimulation(___nodes.current)
      .force('forceManyBody', d3.forceManyBody().strength(5))
      .force(
        'forceCollide',
        d3.forceCollide().radius((d) => {
          return radius + 30
        })
      )
      .on('tick', () => {
        $$gsBg.attr('cx', (d) => get(d, 'x')).attr('cy', (d) => get(d, 'y'))
        $$gsCover.attr('cx', (d) => get(d, 'x')).attr('cy', (d) => get(d, 'y'))
        $$gsTitle.attr('x', (d) => get(d, 'x')).attr('y', (d) => get(d, 'y'))

        $$gsComments
          .attr(
            'cx',
            (d) =>
              get(d, 'node.x') + Math.sin((d.i * Math.PI) / 6) * radius * 1.5
          )
          .attr(
            'cy',
            (d) =>
              get(d, 'node.y') - Math.cos((d.i * Math.PI) / 6) * radius * 1.5
          )

        $$gsCommentsLine
          .attr('x1', (d) => get(d, 'node.x'))
          .attr('y1', (d) => get(d, 'node.y'))

          .attr(
            'x2',
            (d) =>
              get(d, 'node.x') + Math.sin((d.i * Math.PI) / 6) * radius * 1.5
          )
          .attr(
            'y2',
            (d) =>
              get(d, 'node.y') - Math.cos((d.i * Math.PI) / 6) * radius * 1.5
          )
      })

    ___animate.current = () => {
      ___simulation.current.nodes(___nodes.current)

      $$gs = $$gs.data(___nodes.current).join(
        (enter) => {
          return enter.append('g').classed('Bubbles__post', true)
        },
        (update) => {
          return update
        },
        (exit) => exit.remove()
      )

      $$gsCommentsWrapper = $$gs
        .selectAll('.Bubbles__post__comments')
        .data((d) => {
          return [___nodes.current[d.index]]
        })
        .join(
          (enter) => {
            return enter.append('g').classed('Bubbles__post__comments', true)
          },
          (update) => {
            return update
          },
          (exit) => exit.remove()
        )

      $$gsComments = $$gsCommentsWrapper
        .selectAll('.Bubbles__post__comment')
        .data((d) => {
          const currentNode = get(___nodes, `current[${d.index}]`)

          return (get(currentNode, 'comments') || []).map((x, i) => {
            return {
              ...x,
              i,
              node: currentNode, // This has to be kept in as a separated object. An attempt to destructure it would fail. Seems to be used by `.forceSimulation`.
            }
          })
        })
        .join(
          (enter) => {
            return enter
              .append('circle')
              .classed('Bubbles__post__comment', true)
              .attr('r', 0)
              .call((enter) => {
                return enter
                  .transition()
                  .duration(400)
                  .attr('r', 5)
              })
          },
          (update) => {
            return update
          },
          (exit) => exit.remove()
        )

      $$gsCommentsLine = $$gsCommentsWrapper
        .selectAll('.Bubbles__post__comment-line')
        .data((d) => {
          const currentNode = get(___nodes, `current[${d.index}]`)

          return (get(currentNode, 'comments') || []).map((x, i) => {
            return {
              ...x,
              i,
              node: currentNode, // This has to be kept in as a separated object. An attempt to destructure it would fail. Seems to be used by `.forceSimulation`.
            }
          })
        })
        .join(
          (enter) => {
            return enter
              .append('line')
              .classed('Bubbles__post__comment-line', true)
              .attr('stroke-width', 0)
              .call((enter) => {
                return enter
                  .transition()
                  .duration(400)
                  .attr('stroke-width', 1)
              })
          },
          (update) => {
            return update
          },
          (exit) => exit.remove()
        )

      const getRadius = (d) =>
        radius + Math.min(get(d, 'comments.length', 0), 5)

      $$gsBg = $$gs
        .selectAll('.Bubbles__post__bg')
        .data((d) => {
          return [___nodes.current[d.index]]
        })
        .join(
          (enter) => {
            return enter
              .append('circle')
              .classed('Bubbles__post__bg', true)
              .classed(
                'Bubbles__post__bg--center',
                (d) => get(d, 'type') == 'center'
              )
              .attr('r', 0)
              .call((enter) => {
                return enter
                  .transition()
                  .duration(1000)
                  .attr('r', (d) => getRadius(d))
              })
          },
          (update) => {
            return update.transition().attr('r', (d) => getRadius(d))
          },
          (exit) => exit.remove()
        )
        .on('click', (d) => {
          ___nodes.current = ___nodes.current.map((x) => {
            if (x.index == d.index) {
              return {
                ...x,
                comments: [
                  ...(get(x, 'comments') || []),
                  {
                    label: 'x',
                  },
                ],
              }
            }

            return x
          })

          ___animate.current()
        })

      $$gsDefs = $$gs
        .selectAll('defs')
        .data((d) => {
          if (get(d, 'type') == 'center') {
            return [{}]
          }

          return []
        })
        .join(
          (enter) => {
            return enter.append('defs')
          },
          (update) => {
            return update
          },
          (exit) => exit.remove()
        )

      $$gsDefsPattern = $$gsDefs
        .selectAll('pattern')
        .data((d) => {
          return [{}]
        })
        .join(
          (enter) => {
            return enter
              .append('pattern')
              .attr('id', 'img0')
              .attr('width', '100%')
              .attr('height', '100%')
              .attr('patternUnits', 'objectBoundingBox')
              .attr('viewBox', '0 0 1 1')
              .attr('preserveAspectRatio', 'xMidYMid slice')
          },
          (update) => {
            return update
          },
          (exit) => exit.remove()
        )

      $$gsDefsPatternImage = $$gsDefsPattern
        .selectAll('image')
        .data((d) => {
          return [{}]
        })
        .join(
          (enter) => {
            return enter
              .append('image')
              .attr('width', '1')
              .attr('height', '1')
              .attr('preserveAspectRatio', 'xMidYMid slice')
              .attr('xlink:href', 'https://picsum.photos/id/237/200/300')
          },
          (update) => {
            return update
          },
          (exit) => exit.remove()
        )

      $$gsCover = $$gs
        .selectAll('.Bubbles__post__cover')
        .data((d) => {
          if (get(d, 'type') == 'center') {
            return [___nodes.current[d.index]]
          }

          return []
        })
        .join(
          (enter) => {
            return enter
              .append('circle')
              .classed('Bubbles__post__cover', true)
              .attr('r', radius - 2)
              .attr('fill', `url(#img0)`)
              .attr('fill-opacity', 0)
              .call((enter) => {
                return enter
                  .transition()
                  .delay(1000)
                  .duration(400)
                  .attr('fill-opacity', 1)
              })
          },
          (update) => {
            return update
          },
          (exit) => exit.remove()
        )

      $$gsTitle = $$gs
        .selectAll('.Bubbles__post__title')
        .data((d) => {
          if (get(d, 'title')) {
            return [___nodes.current[d.index]]
          }

          return []
        })
        .join(
          (enter) => {
            return enter
              .append('text')
              .classed('Bubbles__post__title', true)
              .classed(
                'Bubbles__post__title--center',
                (d) => get(d, 'type') == 'center'
              )
              .html((d) => {
                return `<tspan>${get(d, 'title')}</tspan>`
              })
              .attr('fill-opacity', 0)
              .call((enter) => {
                return enter
                  .transition()
                  .delay(1000)
                  .duration(400)
                  .attr('fill-opacity', 1)
              })
          },
          (update) => {
            return update
          },
          (exit) => exit.remove()
        )

      ___simulation.current.alpha(1).restart()
    }

    ___animate.current()
  }, [])

  return (
    <div className='Index'>
      <h1 className='Index__h1'>Bubbles</h1>

      <div className='Index__wrapper'>
        <svg viewBox='0 0 800 400' ref={$svg} className='Bubbles'>
          <g ref={$mainG} className='Bubbles__main-g' />
        </svg>
      </div>

      <a
        className='Index__a'
        onClick={() => {
          ___nodes.current = [
            ...___nodes.current,
            {
              x: 400,
              y: 200,
              title: 'Clatter plates.',
            },
          ]

          ___animate.current()
        }}
      >
        Add node
      </a>
    </div>
  )
}

Index.propTypes = {}

export default Index
