/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MessageType } from '@hedgedoc/commons';
import { Mock } from 'ts-mockery';

import { Note } from '../../notes/note.entity';
import * as websocketDocModule from './extended-doc';
import { ExtendedDoc } from './extended-doc';
import { RealtimeNote } from './realtime-note';
import { mockConnection } from './test-utils/mock-connection';

describe('realtime note', () => {
  let mockedDoc: ExtendedDoc;
  let mockedNote: Note;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
    mockedDoc = new ExtendedDoc('');
    jest
      .spyOn(websocketDocModule, 'ExtendedDoc')
      .mockImplementation(() => mockedDoc);

    mockedNote = Mock.of<Note>({ id: 4711 });
  });

  afterAll(() => {
    jest.resetAllMocks();
    jest.resetModules();
  });

  it('can return the given note', () => {
    const sut = new RealtimeNote(mockedNote, 'nothing');
    expect(sut.getNote()).toBe(mockedNote);
  });

  it('can connect and disconnect clients', () => {
    const sut = new RealtimeNote(mockedNote, 'nothing');
    const client1 = mockConnection(true);
    sut.addClient(client1);
    expect(sut.getConnections()).toStrictEqual([client1]);
    expect(sut.hasConnections()).toBeTruthy();
    sut.removeClient(client1);
    expect(sut.getConnections()).toStrictEqual([]);
    expect(sut.hasConnections()).toBeFalsy();
  });

  it('creates a y-doc', () => {
    const sut = new RealtimeNote(mockedNote, 'nothing');
    expect(sut.getYDoc()).toBe(mockedDoc);
  });

  it('destroys y-doc on self-destruction', () => {
    const sut = new RealtimeNote(mockedNote, 'nothing');
    const docDestroy = jest.spyOn(mockedDoc, 'destroy');
    sut.destroy();
    expect(docDestroy).toHaveBeenCalled();
  });

  it('emits destroy event on destruction', async () => {
    const sut = new RealtimeNote(mockedNote, 'nothing');
    const destroyPromise = new Promise<void>((resolve) => {
      sut.once('destroy', () => {
        resolve();
      });
    });
    sut.destroy();
    await expect(destroyPromise).resolves.not.toThrow();
  });

  it("doesn't destroy a destroyed note", () => {
    const sut = new RealtimeNote(mockedNote, 'nothing');
    sut.destroy();
    expect(() => sut.destroy()).toThrow();
  });

  it('announcePermissionChange to all clients', () => {
    const sut = new RealtimeNote(mockedNote, 'nothing');
    const client1 = mockConnection(true);
    sut.addClient(client1);
    const client2 = mockConnection(true);
    sut.addClient(client2);
    const metadataMessage = { type: MessageType.METADATA_UPDATED };
    sut.announcePermissionChange();
    expect(client1.getTransporter().sendMessage).toHaveBeenCalledWith(
      metadataMessage,
    );
    expect(client2.getTransporter().sendMessage).toHaveBeenCalledWith(
      metadataMessage,
    );
    sut.removeClient(client2);
    sut.announcePermissionChange();
    expect(client1.getTransporter().sendMessage).toHaveBeenCalledTimes(2);
    expect(client2.getTransporter().sendMessage).toHaveBeenCalledTimes(1);
  });

  it('announceNoteDeletion to all clients', () => {
    const sut = new RealtimeNote(mockedNote, 'nothing');
    const client1 = mockConnection(true);
    sut.addClient(client1);
    const client2 = mockConnection(true);
    sut.addClient(client2);
    const deletedMessage = { type: MessageType.DOCUMENT_DELETED };
    sut.announceNoteDeletion();
    expect(client1.getTransporter().sendMessage).toHaveBeenCalledWith(
      deletedMessage,
    );
    expect(client2.getTransporter().sendMessage).toHaveBeenCalledWith(
      deletedMessage,
    );
    sut.removeClient(client2);
    sut.announceNoteDeletion();
    expect(client1.getTransporter().sendMessage).toHaveBeenCalledTimes(2);
    expect(client2.getTransporter().sendMessage).toHaveBeenCalledTimes(1);
  });
});
