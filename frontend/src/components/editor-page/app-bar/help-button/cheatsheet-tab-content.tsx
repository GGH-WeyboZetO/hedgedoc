/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { optionalAppExtensions } from '../../../../extensions/extra-integrations/optional-app-extensions'
import { ShowIf } from '../../../common/show-if/show-if'
import type { CheatsheetEntry, CheatsheetExtension } from '../../cheatsheet/cheatsheet-extension'
import { isCheatsheetGroup } from '../../cheatsheet/cheatsheet-extension'
import { Categories } from './categories'
import { CheatsheetRenderer } from './cheatsheet-renderer'
import { EntrySelection } from './entry-selection'
import React, { Fragment, useCallback, useMemo, useState } from 'react'
import { Col, ListGroup, Row } from 'react-bootstrap'

export const CheatsheetTabContent: React.FC = () => {
  const [selectedExtension, setSelectedExtension] = useState<CheatsheetExtension>()
  const [selectedEntry, setSelectedEntry] = useState<CheatsheetEntry>()

  const changeExtension = useCallback((value: CheatsheetExtension) => {
    setSelectedExtension(value)
    setSelectedEntry(isCheatsheetGroup(value) ? value.entries[0] : value)
  }, [])

  const extensions = useMemo(
    () => optionalAppExtensions.flatMap((extension) => extension.buildCheatsheetExtensions()),
    []
  )

  return (
    <Fragment>
      <Row className={`mt-2`}>
        <Col xs={3}>
          <Categories extensions={extensions} selectedEntry={selectedExtension} onStateChange={changeExtension} />
        </Col>
        <Col xs={9}>
          <ListGroup>
            <EntrySelection
              extension={selectedExtension}
              selectedEntry={selectedEntry}
              setSelectedEntry={setSelectedEntry}></EntrySelection>
            <ShowIf condition={selectedEntry !== undefined}>
              <CheatsheetRenderer
                rootI18nKey={isCheatsheetGroup(selectedExtension) ? selectedExtension.i18nKey : undefined}
                extension={selectedEntry as CheatsheetEntry}
              />
            </ShowIf>
          </ListGroup>
        </Col>
      </Row>
    </Fragment>
  )
}
