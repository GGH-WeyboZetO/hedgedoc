/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { HtmlToReact } from './html-to-react'
import { render } from '@testing-library/react'

describe('HTML to React', () => {
  it('renders basic html correctly', () => {
    const view = render(<HtmlToReact htmlCode={'<p>This is a test <b>sentence</b></p>'} />)
    expect(view.container).toMatchSnapshot()
  })

  it("won't render script tags", () => {
    const view = render(<HtmlToReact htmlCode={'<script type="application/javascript">alert("XSS!")</script>'} />)
    expect(view.container).toMatchSnapshot()
  })

  it('will forward the DomPurify settings', () => {
    const view = render(
      <HtmlToReact domPurifyConfig={{ ADD_TAGS: ['test-tag'] }} htmlCode={'<test-tag>Test!</test-tag>'} />
    )
    expect(view.container).toMatchSnapshot()
  })

  it('will forward the parser options', () => {
    let transformerVisited = false
    let preprocessNodesVisited = false

    const view = render(
      <HtmlToReact
        htmlCode={'<p>This is a sentence</p>'}
        parserOptions={{
          transform: () => {
            transformerVisited = true
            return <p>Hijacked!</p>
          },
          preprocessNodes: (document) => {
            preprocessNodesVisited = true
            return document
          }
        }}
      />
    )
    expect(view.container).toMatchSnapshot()
    expect(preprocessNodesVisited).toBeTruthy()
    expect(transformerVisited).toBeTruthy()
  })
})
