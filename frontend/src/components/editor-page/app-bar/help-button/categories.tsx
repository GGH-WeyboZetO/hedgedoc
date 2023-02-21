/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CheatsheetExtension } from '../../cheatsheet/cheatsheet-extension'
import { CheatsheetList } from './cheatsheet-list'
import React, { useMemo } from 'react'
import { Accordion } from 'react-bootstrap'
import { Trans } from 'react-i18next'

export interface GroupAccordionProps {
  extensions: CheatsheetExtension[]
  selectedEntry: CheatsheetExtension | undefined
  onStateChange: (value: CheatsheetExtension) => void
}

const sortCategories = (
  [keyA]: [string, CheatsheetExtension[]],
  [keyB]: [string, CheatsheetExtension[]]
): -1 | 0 | 1 => {
  if (keyA === keyB) {
    return 0
  } else if (keyA > keyB || keyA === 'other') {
    return 1
  } else {
    return -1
  }
}

export const Categories: React.FC<GroupAccordionProps> = ({ extensions, selectedEntry, onStateChange }) => {
  const groupEntries = useMemo(() => {
    const groupings = extensions.reduce((state, extension) => {
      const groupKey = extension.categoryI18nKey ?? 'other'
      const list = state.get(groupKey) ?? []
      list.push(extension)
      if (!state.has(groupKey)) {
        state.set(groupKey, list)
      }
      return state
    }, new Map<string, CheatsheetExtension[]>())
    return Array.from(groupings.entries()).sort(sortCategories)
  }, [extensions])

  const elements = useMemo(() => {
    return groupEntries.map(([groupKey, groupExtensions]) => (
      <Accordion.Item eventKey={groupKey} key={groupKey}>
        <Accordion.Header>
          <Trans i18nKey={`cheatsheet.categories.${groupKey}`}></Trans>
        </Accordion.Header>
        <Accordion.Body className={'p-0'}>
          <CheatsheetList selectedEntry={selectedEntry} extensions={groupExtensions} onStateChange={onStateChange} />
        </Accordion.Body>
      </Accordion.Item>
    ))
  }, [groupEntries, onStateChange, selectedEntry])

  return <Accordion defaultActiveKey={groupEntries[0][0]}>{elements}</Accordion>
}
