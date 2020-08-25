import React from 'react'
import ReactDOMServer from 'react-dom/server'
import PropTypes from 'prop-types'
import {get} from 'lodash'
import className from 'classnames'
import axios from 'axios'
import * as d3 from 'd3'

const Join = (props) => {
  const $svg = React.useRef()
  const $mainG = React.useRef()

  const radius = 20

  const ___nodes = React.useRef(
    Array.from(Array(7)).map((x, i) => {
      if (i == 0) {
        return {
          r: radius,
          fx: 800 / 2,
          fy: 400 / 2,
          comments: [
            {
              label: 'a',
            },
            {
              label: 'b',
            },
          ],
        }
      }

      return {
        r: radius,
      }
    })
  )
  const ___simulation = React.useRef()

  React.useEffect(() => {
    const $$svg = d3.select($svg.current)
    const $$mainG = d3.select($mainG.current)

    ___simulation.current = d3
      .forceSimulation(___nodes.current)
      .force('charge', d3.forceManyBody().strength(5))
      .force('center', d3.forceCenter(800 / 2, 400 / 2))
      .force(
        'collision',
        d3.forceCollide().radius((d) => {
          return d.r + 10
        })
      )
      .on('tick', () => {
        const $g = $$mainG
          .selectAll('g.post')
          .data(___nodes.current)
          .join('g')
          .classed('post', true)

        $g.selectAll('circle')
          .data((d) => {
            return [
              {
                x: d.x,
                y: d.y,
              },
            ]
          })
          .join('circle')
          .attr('r', radius)
          .attr('cx', (d) => d.x)
          .attr('cy', (d) => d.y)

        $g.selectAll('text.label')
          .data((d, i) => {
            return [
              {
                x: d.x,
                y: d.y,
                i,
              },
            ]
          })
          .join('text')
          .classed('label', true)
          .attr('x', (d) => d.x)
          .attr('y', (d) => d.y)
          .text((d) => d.i)
          .on('click', (d) => {
            ___nodes.current = ___nodes.current.map((x) => {
              if (x.index == d.i) {
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

            ___simulation.current.nodes(___nodes.current)
            ___simulation.current.alpha(1).restart()
          })

        $g.selectAll('g.comments')
          .data((d, i) => {
            if (!get(d, 'comments')) {
              return []
            }

            return [
              {
                comments: (get(d, 'comments') || []).map((x, i) => {
                  return {
                    x: d.x,
                    y: d.y,
                    i,
                    label: get(x, 'label'),
                  }
                }),
              },
            ]
          })
          .join('g')
          .classed('comments', true)
          .selectAll('text')
          .data((d) => get(d, 'comments') || [])
          .join('text')
          .attr('x', (d) => d.x + Math.sin((d.i * Math.PI) / 6) * radius * 1.25)
          .attr('y', (d) => d.y - Math.cos((d.i * Math.PI) / 6) * radius * 1.25)
          .text((d) => d.label)
      })

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
  }, [])

  return (
    <div className='Index'>
      <h1 className='Index__h1'>Bubbles</h1>

      <div className='Index__wrapper'>
        <svg viewBox='0 0 800 400' ref={$svg} className='Index__svg'>
          <g ref={$mainG} className='Index__svg__main-g' />
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
              r: radius,
              comments: [
                {
                  label: 'a',
                },
              ],
            },
          ]

          // ___nodes.current = ___nodes.current.map((x, i) => {
          //   if (i == 0) {
          //     return {
          //       ...x,
          //       r: 80,
          //     }
          //   }
          //
          //   return x
          // })

          ___simulation.current.nodes(___nodes.current)
          ___simulation.current.alpha(1).restart()
        }}
      >
        Add node
      </a>
    </div>
  )
}

Join.propTypes = {}

export default Join
