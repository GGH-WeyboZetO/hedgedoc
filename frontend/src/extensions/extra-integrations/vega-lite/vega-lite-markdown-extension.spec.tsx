/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CodeProps } from '../../../components/markdown-renderer/replace-components/code-block-component-replacer'
import { mockI18n } from '../../../components/markdown-renderer/test-utils/mock-i18n'
import { TestMarkdownRenderer } from '../../../components/markdown-renderer/test-utils/test-markdown-renderer'
import * as VegaLiteChartModule from '../vega-lite/vega-lite-chart'
import { VegaLiteMarkdownExtension } from './vega-lite-markdown-extension'
import { render } from '@testing-library/react'
import React from 'react'

jest.mock('../vega-lite/vega-lite-chart')

describe('Vega-Lite markdown extensions', () => {
  beforeAll(async () => {
    jest.spyOn(VegaLiteChartModule, 'VegaLiteChart').mockImplementation((({ code }) => {
      return (
        <span>
          this is a mock for vega lite
          <code>{code}</code>
        </span>
      )
    }) as React.FC<CodeProps>)
    await mockI18n()
  })

  it('renders a vega-lite codeblock', () => {
    const view = render(
      <TestMarkdownRenderer
        extensions={[new VegaLiteMarkdownExtension()]}
        content={
          '```vega-lite\n{"$schema":"https://vega.github.io/schema/vega-lite/v4.json","data":{"values":[{"a":"","b":28}]},"mark":"bar","encoding":{"x":{"field":"a"},"y":{"field":"b"}}}\n```'
        }
      />
    )
    expect(view.container).toMatchSnapshot()
  })
})
