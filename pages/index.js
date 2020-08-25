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

  const $$gs = React.useRef()
  const $$gsCircles = React.useRef()

  const radius = 20

  const ___nodes = React.useRef(
    Array.from(Array(7)).map((x, i) => {
      if (i == 0) {
        return {
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

      return {}
    })
  )

  const ___simulation = React.useRef()
  const ___animate = React.useRef()

  React.useEffect(() => {
    const $$svg = d3.select($svg.current)
    const $$mainG = d3.select($mainG.current)

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

    $$gs.current = $$mainG.selectAll('g.post')

    ___simulation.current = d3
      .forceSimulation(___nodes.current)
      .force('charge', d3.forceManyBody().strength(5))
      .force('center', d3.forceCenter(800 / 2, 400 / 2))
      .force(
        'collision',
        d3.forceCollide().radius((d) => {
          return radius + 10
        })
      )
      .on('tick', () => {
        $$gsCircles.current
          .attr('cx', (d) => get(d, 'x'))
          .attr('cy', (d) => get(d, 'y'))
      })
      .stop()

    ___animate.current = () => {
      ___simulation.current.nodes(___nodes.current)

      $$gs.current = $$gs.current.data(___nodes.current).join(
        (enter) => {
          return enter.append('g').classed('post', true)
        },
        (update) => {
          return update
        },
        (exit) => exit.remove()
      )

      $$gsCircles.current = $$gs.current
        .selectAll('circle')
        .data((d) => {
          return [___nodes.current[d.index]]
        })
        .join(
          (enter) => {
            return enter
              .append('circle')
              .attr('r', 5)
              .call((enter) => {
                return enter
                  .transition()
                  .duration(3000)
                  .attr('r', radius)
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
