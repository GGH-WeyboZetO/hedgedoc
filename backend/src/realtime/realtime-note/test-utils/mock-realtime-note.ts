/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { EventEmitter2 } from 'eventemitter2';
import { Mock } from 'ts-mockery';
import { Doc } from 'yjs';

import { Note } from '../../../notes/note.entity';
import { ExtendedDoc } from '../extended-doc';
import { RealtimeNote, RealtimeNoteEventMap } from '../realtime-note';

class MockRealtimeNote extends EventEmitter2<RealtimeNoteEventMap> {
  constructor(private note: Note, private doc: Doc) {
    super();
  }

  public getNote(): Note {
    return this.note;
  }

  public getYDoc(): Doc {
    return this.doc;
  }

  public removeClient(): void {
    //left blank for mock
  }

  public destroy(): void {
    //left blank for mock
  }
}

/**
 * Provides a partial mock for {@link RealtimeNote}
 * @param doc Defines the return value for `getYDoc`
 */
export function mockRealtimeNote(note?: Note, doc?: ExtendedDoc): RealtimeNote {
  return Mock.from<RealtimeNote>(
    new MockRealtimeNote(note ?? Mock.of<Note>(), doc ?? new ExtendedDoc('')),
  );
}
