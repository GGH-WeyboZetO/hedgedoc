/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { changeEditorContentContext } from '../../change-content-context/change-content-context'
import type { Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { Optional } from '@mrdrogdrog/optional'
import { useContext, useMemo } from 'react'

export const useUpdateCodeMirrorReference = (): Extension => {
  const [codeMirrorReference, setCodeMirrorReference] = Optional.ofNullable(
    useContext(changeEditorContentContext)
  ).orElseThrow(() => new Error('No change content received. Did you forget to use the provider component'))

  return useMemo(() => {
    return EditorView.updateListener.of((update) => {
      if (codeMirrorReference !== update.view) {
        setCodeMirrorReference(update.view)
      }
    })
  }, [codeMirrorReference, setCodeMirrorReference])
}
