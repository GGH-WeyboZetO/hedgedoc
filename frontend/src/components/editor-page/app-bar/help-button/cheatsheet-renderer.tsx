/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import HighlightedCode from '../../../../extensions/extra-integrations/highlighted-code-fence/highlighted-code'
import { ExtensionEventEmitterProvider } from '../../../markdown-renderer/hooks/use-extension-event-emitter'
import { RendererType } from '../../../render-page/window-post-message-communicator/rendering-message'
import type { CheatsheetEntry } from '../../cheatsheet/cheatsheet-extension'
import { EditorToRendererCommunicatorContextProvider } from '../../render-context/editor-to-renderer-communicator-context-provider'
import { RenderIframe } from '../../renderer-pane/render-iframe'
import { ReadMoreLinkItem } from './read-more-link-item'
import { useComponentsFromAppExtensions } from './use-components-from-app-extensions'
import React, { useEffect, useMemo, useState } from 'react'
import { ListGroupItem } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'

interface CheatsheetRendererProps {
  rootI18nKey?: string
  extension: CheatsheetEntry
}

export const CheatsheetRenderer: React.FC<CheatsheetRendererProps> = ({ extension, rootI18nKey }) => {
  const { t } = useTranslation()

  const [content, setContent] = useState('')

  const lines = useMemo(() => content.split('\n'), [content])

  const i18nPrefix = useMemo(
    () => `cheatsheet.${rootI18nKey ? `${rootI18nKey}.` : ''}${extension.i18nKey}.`,
    [extension.i18nKey, rootI18nKey]
  )

  useEffect(() => {
    setContent(t(`${i18nPrefix}example`) ?? '')
  }, [extension, i18nPrefix, t])

  const cheatsheetExtensionComponents = useComponentsFromAppExtensions(setContent)

  return (
    <EditorToRendererCommunicatorContextProvider>
      <ExtensionEventEmitterProvider>
        {cheatsheetExtensionComponents}
        <ListGroupItem>
          <h4>
            <Trans i18nKey={'cheatsheet.modal.headlines.description'} />
          </h4>
          <Trans i18nKey={`${i18nPrefix}description`}></Trans>
        </ListGroupItem>
        <ReadMoreLinkItem url={extension.readMoreUrl}></ReadMoreLinkItem>
        <ListGroupItem>
          <h4>
            <Trans i18nKey={'cheatsheet.modal.headlines.exampleInput'} />
          </h4>
          <HighlightedCode code={content} wrapLines={true} language={'markdown'} startLineNumber={1} />
        </ListGroupItem>
        <ListGroupItem>
          <h4>
            <Trans i18nKey={'cheatsheet.modal.headlines.exampleOutput'} />
          </h4>
          <RenderIframe
            frameClasses={'w-100'}
            adaptFrameHeightToContent={true}
            rendererType={RendererType.MOTD}
            markdownContentLines={lines}></RenderIframe>
        </ListGroupItem>
      </ExtensionEventEmitterProvider>
    </EditorToRendererCommunicatorContextProvider>
  )
}
