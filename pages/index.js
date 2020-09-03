import React from 'react'
import ReactDOMServer from 'react-dom/server'
import PropTypes from 'prop-types'
import {get, tail, takeRight, find} from 'lodash'
import className from 'classnames'
import axios from 'axios'
import * as d3 from 'd3'

const WIDTH = 800
const HEIGHT = 400

const rand = () => ~~(Math.random() * 100)

const Index = (props) => {
  const $svg = React.useRef()
  const $mainG = React.useRef()

  const ___nodes = React.useRef([
    {
      id: +new Date(),
      fx: WIDTH / 2,
      fy: HEIGHT / 2,
      type: 'center',
      title: '阪神 0 - 0 巨人',
      cover: `https://picsum.photos/id/${rand()}/200/300`,
    },
  ])

  const ___simulation = React.useRef()
  const ___animate = React.useRef()

  React.useEffect(() => {
    const $$svg = d3.select($svg.current)
    const $$mainG = d3.select($mainG.current)
    const radius = 30

    let $$gs

    let $$gsDefs
    let $$gsDefsPattern
    let $$gsDefsPatternImage

    let $$gsCommentsWrapper
    let $$gsCommentsDefs
    let $$gsComments
    let $$gsCommentsLine
    let $$gsCommentsCover

    let $$gsBg
    let $$gsCover
    let $$gsProfileImage
    let $$gsTitle
    let $$gsZoom

    // START zoom

    const zoom = d3
      .zoom()
      .extent([
        [0, 0],
        [WIDTH, HEIGHT],
      ])
      .scaleExtent([1 / (2 * 1), 2 * 4])
      .translateExtent([
        [-100, -100],
        [WIDTH + 100, HEIGHT + 100],
      ])
      .on('zoom', (event) => {
        $$mainG.attr('transform', event.transform)
      })

    $$svg.call(zoom)
    $$svg.on('dblclick.zoom', null)

    // END zoom

    const getRadius = (d) =>
      radius + Math.min(get(d, 'comments.length', 0), 5) * 0.5

    $$gs = $$mainG.selectAll('.Bubbles__post')

    ___simulation.current = d3
      .forceSimulation(___nodes.current)
      .force('forceManyBody', d3.forceManyBody().strength(10))
      .force(
        'forceCollide',
        d3.forceCollide().radius((d) => {
          return radius + 30
        })
      )
      .on('tick', () => {
        $$gsBg.attr('cx', (d) => get(d, 'x')).attr('cy', (d) => get(d, 'y'))
        $$gsCover.attr('cx', (d) => get(d, 'x')).attr('cy', (d) => get(d, 'y'))

        $$gsTitle
          .attr('x', (d) => get(d, 'x'))
          .attr('y', (d) => get(d, 'y') - 3)

        $$gsZoom.attr('x', (d) => get(d, 'x')).attr('y', (d) => get(d, 'y') + 6)

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

        $$gsCommentsCover
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

        $$gsProfileImage
          .attr(
            'cx',
            (d) => get(d, 'x') + Math.sin((10.5 * Math.PI) / 6) * radius * 0.95
          )
          .attr(
            'cy',
            (d) => get(d, 'y') - Math.cos((10.5 * Math.PI) / 6) * radius * 0.95
          )
      })

    ___animate.current = () => {
      ___simulation.current.nodes(___nodes.current)

      $$gs = $$gs
        .data(___nodes.current, (d) => get(d, 'id'))
        .join(
          (enter) => {
            return enter.append('g').classed('Bubbles__post', true)
          },
          (update) => {
            return update
          },
          (exit) => {
            exit.selectAll('*:not([class="Bubbles__post__bg"])').remove()

            exit
              .select('.Bubbles__post__bg')
              .transition()
              .attr('r', 0)

            return exit.call((exit) => {
              return exit
                .transition()
                .delay(2000)
                .remove()
            })
          }
        )

      $$gsDefs = $$gs
        .selectAll('defs')
        .data(
          (d) => {
            return [d]
          },
          (d) => get(d, 'id')
        )
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
        .data(
          (d) => {
            let _images = []

            if (get(d, 'cover')) {
              _images = [
                ..._images,
                {
                  id: `${get(d, 'id')}-cover`,
                  href: get(d, 'cover'),
                },
              ]
            }

            if (get(d, 'profileImage')) {
              _images = [
                ..._images,
                {
                  id: `${get(d, 'id')}-profile-image`,
                  href: get(d, 'profileImage'),
                },
              ]
            }

            if (get(d, 'comments')) {
              _images = [
                ..._images,
                ...get(d, 'comments').map((x, i) => {
                  return {
                    id: `${get(d, 'id')}-comment-${get(x, 'id')}`,
                    href: get(x, 'cover'),
                  }
                }),
              ]
            }

            return _images
          },
          (d) => get(d, 'id')
        )
        .join(
          (enter) => {
            return enter
              .append('pattern')
              .attr('id', (d) => get(d, 'id'))
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
        .data(
          (d) => {
            return [d]
          },
          (d) => get(d, 'id')
        )
        .join(
          (enter) => {
            return enter
              .append('image')
              .attr('width', '1')
              .attr('height', '1')
              .attr('preserveAspectRatio', 'xMidYMid slice')
              .attr('xlink:href', (d) => get(d, 'href'))
          },
          (update) => {
            return update
          },
          (exit) => exit.remove()
        )

      $$gsCommentsWrapper = $$gs
        .selectAll('.Bubbles__post__comments')
        .data(
          (d) => {
            return [___nodes.current[d.index]]
          },
          (d) => get(d, 'id')
        )
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
        .data(
          (d) => {
            const currentNode = get(___nodes, `current[${d.index}]`)

            return (get(currentNode, 'comments') || []).map((x, i) => {
              return {
                ...x,
                i,
                node: currentNode, // This has to be kept in as a separated object. An attempt to destructure it would fail. Seems to be used by `.forceSimulation`.
              }
            })
          },
          (d) => get(d, 'id')
        )
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
        .data(
          (d) => {
            const currentNode = get(___nodes, `current[${d.index}]`)

            return (get(currentNode, 'comments') || []).map((x, i) => {
              return {
                ...x,
                i,
                node: currentNode, // This has to be kept in as a separated object. An attempt to destructure it would fail. Seems to be used by `.forceSimulation`.
              }
            })
          },
          (d) => get(d, 'id')
        )
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

      $$gsCommentsCover = $$gsCommentsWrapper
        .selectAll('.Bubbles__post__comment-cover')
        .data(
          (d) => {
            const currentNode = get(___nodes, `current[${d.index}]`)

            return (get(currentNode, 'comments') || []).map((x, i) => {
              return {
                ...x,
                i,
                node: currentNode, // This has to be kept in as a separated object. An attempt to destructure it would fail. Seems to be used by `.forceSimulation`.
              }
            })
          },
          (d) => get(d, 'id')
        )
        .join(
          (enter) => {
            return enter
              .append('circle')
              .classed('Bubbles__post__comment-cover', true)
              .attr('r', 4)
              .attr(
                'fill',
                (d, i) => `url(#${get(d, 'node.id')}-comment-${get(d, 'id')})`
              )
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

      $$gsBg = $$gs
        .selectAll('.Bubbles__post__bg')
        .data(
          (d) => {
            return [___nodes.current[d.index]]
          },
          (d) => get(d, 'id')
        )
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
            return update.call((update) => {
              return update.transition().attr('r', (d) => getRadius(d))
            })
          },
          (exit) => {
            return exit.remove()
          }
        )

      $$gsProfileImage = $$gs
        .selectAll('.Bubbles__post__profile-image')
        .data(
          (d) => {
            if (get(d, 'type') == 'center') {
              return []
            }

            return [___nodes.current[d.index]]
          },
          (d) => get(d, 'id')
        )
        .join(
          (enter) => {
            return enter
              .append('circle')
              .classed('Bubbles__post__profile-image', true)
              .attr('fill', (d) => `url(#${get(d, 'id')}-profile-image)`)
              .attr('r', 7)
              .attr('fill-opacity', 0)
              .attr('stroke-opacity', 0)
              .call((enter) => {
                return enter
                  .transition()
                  .delay(1400)
                  .duration(400)
                  .attr('fill-opacity', 1)
                  .attr('stroke-opacity', 1)
              })
          },
          (update) => {
            return update
          },
          (exit) => exit.remove()
        )

      $$gsCover = $$gs
        .selectAll('.Bubbles__post__cover')
        .data(
          (d) => {
            if (get(d, 'type') == 'center') {
              return [___nodes.current[d.index]]
            }

            return []
          },
          (d) => get(d, 'id')
        )
        .join(
          (enter) => {
            return enter
              .append('circle')
              .classed('Bubbles__post__cover', true)
              .attr('r', radius - 2)
              .attr('fill', (d) => `url(#${get(d, 'id')}-cover)`)
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
        .data(
          (d) => {
            if (get(d, 'title')) {
              return [___nodes.current[d.index]]
            }

            return []
          },
          (d) => get(d, 'id')
        )
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
        .on('click', (event, d) => {
          ___nodes.current = ___nodes.current.map((x) => {
            if (x.id == d.id) {
              return {
                ...x,
                comments: [
                  ...(get(x, 'comments') || []),
                  {
                    id: +new Date(),
                    cover: `https://picsum.photos/id/${rand()}/200/300`,
                  },
                ],
              }
            }

            return x
          })

          ___animate.current()
        })

      $$gsZoom = $$gs
        .selectAll('.Bubbles__post__zoom')
        .data(
          (d) => {
            if (get(d, 'type') != 'center') {
              return [___nodes.current[d.index]]
            }

            return []
          },
          (d) => get(d, 'id')
        )
        .join(
          (enter) => {
            return enter
              .append('text')
              .classed('Bubbles__post__zoom', true)
              .text('Click to zoom')
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
        .on('click', (event, d) => {
          event.stopPropagation()

          $$svg
            .transition()
            .duration(750)
            .call(
              zoom.transform,
              d3.zoomIdentity
                .translate(WIDTH / 2, HEIGHT / 2)
                .scale(2 * 3)
                .translate(get(d, 'x') * -1, get(d, 'y') * -1),
              d3.pointer(event, $$svg.node())
            )
        })

      ___simulation.current.alpha(1).restart()
    }

    ___animate.current()
  }, [])

  return (
    <div className='Index'>
      <h1 className='Index__h1'>Bubbles</h1>

      <div className='Index__wrapper'>
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} ref={$svg} className='Bubbles'>
          <g ref={$mainG} className='Bubbles__main-g' />
        </svg>
      </div>

      <a
        className='Index__a'
        onClick={() => {
          ___nodes.current = [
            get(___nodes, 'current.0'),
            ...takeRight(
              [
                ...tail(get(___nodes, 'current')),
                {
                  id: +new Date(),
                  x: WIDTH / 2,
                  y: HEIGHT / 2,
                  title: 'Click to comment',
                  profileImage: `https://picsum.photos/id/${rand()}/200/300`,
                },
              ],
              40
            ),
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
