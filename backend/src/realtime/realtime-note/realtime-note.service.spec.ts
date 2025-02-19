/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SchedulerRegistry } from '@nestjs/schedule';
import { Mock } from 'ts-mockery';

import { AppConfig } from '../../config/app.config';
import { ConsoleLoggerService } from '../../logger/console-logger.service';
import { Note } from '../../notes/note.entity';
import { Revision } from '../../revisions/revision.entity';
import { RevisionsService } from '../../revisions/revisions.service';
import { RealtimeNote } from './realtime-note';
import { RealtimeNoteStore } from './realtime-note-store';
import { RealtimeNoteService } from './realtime-note.service';

describe('RealtimeNoteService', () => {
  const mockedContent = 'mockedContent';
  const mockedYjsState = [1, 2, 3];
  const mockedNoteId = 4711;
  let note: Note;
  let realtimeNote: RealtimeNote;
  let realtimeNoteService: RealtimeNoteService;
  let revisionsService: RevisionsService;
  let realtimeNoteStore: RealtimeNoteStore;
  let consoleLoggerService: ConsoleLoggerService;
  let mockedAppConfig: AppConfig;
  let addIntervalSpy: jest.SpyInstance;
  let setIntervalSpy: jest.SpyInstance;
  let clearIntervalSpy: jest.SpyInstance;
  let deleteIntervalSpy: jest.SpyInstance;

  afterAll(() => {
    jest.useRealTimers();
  });
  beforeAll(() => {
    jest.useFakeTimers();
  });

  function mockGetLatestRevision(
    latestRevisionExists: boolean,
    hasYjsState = false,
  ) {
    jest
      .spyOn(revisionsService, 'getLatestRevision')
      .mockImplementation((note: Note) =>
        note.id === mockedNoteId && latestRevisionExists
          ? Promise.resolve(
              Mock.of<Revision>({
                content: mockedContent,
                ...(hasYjsState ? { yjsStateVector: mockedYjsState } : {}),
              }),
            )
          : Promise.reject('Revision for note mockedNoteId not found.'),
      );
  }

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.resetModules();

    note = Mock.of<Note>({ id: mockedNoteId });
    realtimeNote = new RealtimeNote(note, mockedContent);

    revisionsService = Mock.of<RevisionsService>({
      getLatestRevision: jest.fn(),
      createRevision: jest.fn(),
    });

    consoleLoggerService = Mock.of<ConsoleLoggerService>({
      error: jest.fn(),
    });
    realtimeNoteStore = Mock.of<RealtimeNoteStore>({
      find: jest.fn(),
      create: jest.fn(),
      getAllRealtimeNotes: jest.fn(),
    });

    mockedAppConfig = Mock.of<AppConfig>({ persistInterval: 0 });

    const schedulerRegistry = Mock.of<SchedulerRegistry>({
      addInterval: jest.fn(),
      deleteInterval: jest.fn(),
    });

    addIntervalSpy = jest.spyOn(schedulerRegistry, 'addInterval');
    deleteIntervalSpy = jest.spyOn(schedulerRegistry, 'deleteInterval');
    setIntervalSpy = jest.spyOn(global, 'setInterval');
    clearIntervalSpy = jest.spyOn(global, 'clearInterval');

    realtimeNoteService = new RealtimeNoteService(
      revisionsService,
      consoleLoggerService,
      realtimeNoteStore,
      schedulerRegistry,
      mockedAppConfig,
    );
  });

  it("creates a new realtime note if it doesn't exist yet", async () => {
    mockGetLatestRevision(true);
    jest.spyOn(realtimeNoteStore, 'find').mockImplementation(() => undefined);
    jest
      .spyOn(realtimeNoteStore, 'create')
      .mockImplementation(() => realtimeNote);
    mockedAppConfig.persistInterval = 0;

    await expect(
      realtimeNoteService.getOrCreateRealtimeNote(note),
    ).resolves.toBe(realtimeNote);

    expect(realtimeNoteStore.find).toHaveBeenCalledWith(mockedNoteId);
    expect(realtimeNoteStore.create).toHaveBeenCalledWith(
      note,
      mockedContent,
      undefined,
    );
    expect(setIntervalSpy).not.toHaveBeenCalled();
  });

  it("creates a new realtime note with a yjs state if it doesn't exist yet", async () => {
    mockGetLatestRevision(true, true);
    jest.spyOn(realtimeNoteStore, 'find').mockImplementation(() => undefined);
    jest
      .spyOn(realtimeNoteStore, 'create')
      .mockImplementation(() => realtimeNote);
    mockedAppConfig.persistInterval = 0;

    await expect(
      realtimeNoteService.getOrCreateRealtimeNote(note),
    ).resolves.toBe(realtimeNote);

    expect(realtimeNoteStore.find).toHaveBeenCalledWith(mockedNoteId);
    expect(realtimeNoteStore.create).toHaveBeenCalledWith(
      note,
      mockedContent,
      mockedYjsState,
    );
    expect(setIntervalSpy).not.toHaveBeenCalled();
  });

  describe('with periodic timer', () => {
    it('starts a timer if config has set an interval', async () => {
      mockGetLatestRevision(true);
      jest.spyOn(realtimeNoteStore, 'find').mockImplementation(() => undefined);
      jest
        .spyOn(realtimeNoteStore, 'create')
        .mockImplementation(() => realtimeNote);
      mockedAppConfig.persistInterval = 10;

      await realtimeNoteService.getOrCreateRealtimeNote(note);

      expect(setIntervalSpy).toHaveBeenCalledWith(
        expect.any(Function),
        1000 * 60 * 10,
      );
      expect(addIntervalSpy).toHaveBeenCalled();
    });

    it('stops the timer if the realtime note gets destroyed', async () => {
      mockGetLatestRevision(true);
      jest.spyOn(realtimeNoteStore, 'find').mockImplementation(() => undefined);
      jest
        .spyOn(realtimeNoteStore, 'create')
        .mockImplementation(() => realtimeNote);
      mockedAppConfig.persistInterval = 10;

      await realtimeNoteService.getOrCreateRealtimeNote(note);
      realtimeNote.emit('destroy');
      expect(deleteIntervalSpy).toHaveBeenCalled();
      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });

  it("fails if the requested note doesn't exist", async () => {
    mockGetLatestRevision(false);

    jest.spyOn(realtimeNoteStore, 'find').mockImplementation(() => undefined);

    await expect(
      realtimeNoteService.getOrCreateRealtimeNote(note),
    ).rejects.toBe(`Revision for note mockedNoteId not found.`);
    expect(realtimeNoteStore.create).not.toHaveBeenCalled();
    expect(realtimeNoteStore.find).toHaveBeenCalledWith(mockedNoteId);
  });

  it("doesn't create a new realtime note if there is already one", async () => {
    mockGetLatestRevision(true);

    jest.spyOn(realtimeNoteStore, 'find').mockImplementation(() => undefined);
    jest
      .spyOn(realtimeNoteStore, 'create')
      .mockImplementation(() => realtimeNote);

    await expect(
      realtimeNoteService.getOrCreateRealtimeNote(note),
    ).resolves.toBe(realtimeNote);

    jest
      .spyOn(realtimeNoteStore, 'find')
      .mockImplementation(() => realtimeNote);

    await expect(
      realtimeNoteService.getOrCreateRealtimeNote(note),
    ).resolves.toBe(realtimeNote);
    expect(realtimeNoteStore.create).toHaveBeenCalledTimes(1);
  });

  it('saves a realtime note if it gets destroyed', async () => {
    mockGetLatestRevision(true);

    jest.spyOn(realtimeNoteStore, 'find').mockImplementation(() => undefined);
    jest
      .spyOn(realtimeNoteStore, 'create')
      .mockImplementation(() => realtimeNote);

    await realtimeNoteService.getOrCreateRealtimeNote(note);

    const createRevisionSpy = jest
      .spyOn(revisionsService, 'createRevision')
      .mockImplementation(() => Promise.resolve(Mock.of<Revision>()));

    realtimeNote.emit('beforeDestroy');
    expect(createRevisionSpy).toHaveBeenCalledWith(
      note,
      mockedContent,
      expect.any(Array),
    );
  });

  it('destroys every realtime note on application shutdown', () => {
    jest
      .spyOn(realtimeNoteStore, 'getAllRealtimeNotes')
      .mockReturnValue([realtimeNote]);

    const destroySpy = jest.spyOn(realtimeNote, 'destroy');

    realtimeNoteService.beforeApplicationShutdown();

    expect(destroySpy).toHaveBeenCalled();
  });
});
