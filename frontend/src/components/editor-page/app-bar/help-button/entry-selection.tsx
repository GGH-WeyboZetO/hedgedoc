/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ShowIf } from '../../../common/show-if/show-if'
import type { CheatsheetEntry, CheatsheetExtension } from '../../cheatsheet/cheatsheet-extension'
import { isCheatsheetGroup } from '../../cheatsheet/cheatsheet-extension'
import React, { useMemo } from 'react'
import { Button, ButtonGroup, ListGroupItem } from 'react-bootstrap'
import { Trans } from 'react-i18next'

interface EntrySelectionProps {
  extension: CheatsheetExtension | undefined
  selectedEntry: CheatsheetEntry | undefined
  setSelectedEntry: (value: CheatsheetEntry) => void
}

export const EntrySelection: React.FC<EntrySelectionProps> = ({ extension, selectedEntry, setSelectedEntry }) => {
  const subKeys = useMemo(() => {
    if (!isCheatsheetGroup(extension)) {
      return null
    }
    return extension.entries.map((entry) => (
      <Button
        key={entry.i18nKey}
        variant={selectedEntry?.i18nKey === entry.i18nKey ? 'primary' : 'outline-primary'}
        onClick={() => setSelectedEntry(entry)}>
        <Trans i18nKey={`cheatsheet.${extension.i18nKey}.${entry.i18nKey}.title`}></Trans>
      </Button>
    ))
  }, [extension, selectedEntry?.i18nKey, setSelectedEntry])

  return (
    <ShowIf condition={!!subKeys}>
      <ListGroupItem>
        <h4>
          <Trans i18nKey={'cheatsheet.modal.headlines.selectTopic'} />
        </h4>
        <ButtonGroup className={'mb-2'}>{subKeys}</ButtonGroup>
      </ListGroupItem>
    </ShowIf>
  )
}
