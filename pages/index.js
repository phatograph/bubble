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

  const radius = 20

  const ___nodes = React.useRef(
    Array.from(Array(7)).map((x, i) => {
      if (i == 0) {
        return {
          r: radius,
          fx: 800 / 2,
          fy: 400 / 2,
          comments: [{}, {}],
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
          .selectAll('g')
          .data(___nodes.current)
          .join('g')

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
          .attr('r', 10)
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
          .attr('x', (d) => d.x)
          .attr('y', (d) => d.y)
          .text((d) => d.i)
          .classed('label', true)

        $g.selectAll('text.comments')
          .data((d, i) => {
            return (get(d, 'comments') || []).map((x, i) => {
              return {
                x: d.x,
                y: d.y,
                i,
              }
            })
          })
          .join('text')
          .attr('x', (d) => d.x)
          .attr('y', (d) => d.y + 10 * (d.i + 1))
          .text('x')
          .classed('comments', true)
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
              comments: [{}],
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

Index.propTypes = {}

export default Index
