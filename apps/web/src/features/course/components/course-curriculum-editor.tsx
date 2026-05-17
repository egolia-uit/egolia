'use client';

import {
  ArrowDown,
  ArrowUp,
  FilePlus2,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '#/components/ui/neumorphism/button';
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/neumorphism/card';
import { Input } from '#/components/ui/neumorphism/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/shadcn/dialog';
import { apiClient } from '#/lib/api';
import {
  createLesson,
  createSection,
  deleteLesson,
  deleteSection,
  editTestLesson,
  editVideoLesson,
  getLessonDetail,
  moveLesson,
  moveSection,
  type CourseCourseDetail,
  type CourseLesson,
  updateSectionTitle,
} from '#/lib/api/course';
import { normalizeApiError, type ApiProblem } from '#/lib/api/errors';

import { ErrorState, InlineNotice } from './course-states';

type CourseCurriculumEditorProps = {
  courseId: string;
  course: CourseCourseDetail;
  reload: () => void;
  setCourse: (
    updater: (course: CourseCourseDetail) => CourseCourseDetail
  ) => void;
};

type LessonEditorState = {
  key: string;
  sectionId: string;
  lessonId?: string;
  title: string;
  lessonType: 'video' | 'test';
  videoKey: string;
  duration: string;
  questions: unknown[];
};

type LocalLessonMeta = {
  lessonType: 'video' | 'test';
  videoKey?: string;
  duration?: string;
  questions?: unknown[];
};

function isUnimplemented(problem: ApiProblem) {
  return problem.status === 501 || problem.code === 'unimplemented';
}

function isLocalId(value?: string) {
  return Boolean(value?.startsWith('local-'));
}

function localId(prefix: 'section' | 'lesson') {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `local-${prefix}-${crypto.randomUUID()}`;
  }
  return `local-${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function moveItem<T>(items: T[], from: number, to: number) {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
    return items;
  }
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function lessonKey(sectionId: string, lesson: CourseLesson, index: number) {
  return lesson.id ?? `${sectionId}::${index}`;
}

export function CourseCurriculumEditor({
  courseId,
  course,
  reload,
  setCourse,
}: CourseCurriculumEditorProps) {
  const [actionError, setActionError] = useState<ApiProblem | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const [createSectionTitle, setCreateSectionTitle] = useState('');
  const [renamingSectionId, setRenamingSectionId] = useState<string | null>(null);
  const [renamingSectionTitle, setRenamingSectionTitle] = useState('');

  const [addingLessonSectionId, setAddingLessonSectionId] = useState<string | null>(
    null
  );
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonType, setNewLessonType] = useState<'video' | 'test'>('video');
  const [newLessonVideoKey, setNewLessonVideoKey] = useState('');
  const [newLessonDuration, setNewLessonDuration] = useState('0');

  const [lessonEditor, setLessonEditor] = useState<LessonEditorState | null>(null);
  const [lessonEditorOpen, setLessonEditorOpen] = useState(false);
  const [localLessonMeta, setLocalLessonMeta] = useState<Record<string, LocalLessonMeta>>(
    {}
  );

  function begin(actionKey: string) {
    setBusyAction(actionKey);
    setActionError(null);
    setActionMessage(null);
  }

  function end() {
    setBusyAction(null);
  }

  function setSections(
    updater: (sections: CourseCourseDetail['sections']) => CourseCourseDetail['sections']
  ) {
    setCourse((current) => ({
      ...current,
      sections: updater(current.sections),
    }));
  }

  function updateLessonTitle(sectionId: string, key: string, nextTitle: string) {
    setSections((sections) =>
      sections.map((section) => {
        if (section.id !== sectionId) {
          return section;
        }
        return {
          ...section,
          lessons: section.lessons.map((lesson, index) =>
            lessonKey(sectionId, lesson, index) === key
              ? {
                ...lesson,
                title: nextTitle,
              }
              : lesson
          ),
        };
      })
    );
  }

  function removeLesson(sectionId: string, key: string) {
    setSections((sections) =>
      sections.map((section) => {
        if (section.id !== sectionId) {
          return section;
        }
        return {
          ...section,
          lessons: section.lessons.filter(
            (lesson, index) => lessonKey(sectionId, lesson, index) !== key
          ),
        };
      })
    );
  }

  function moveLessonLocally(sectionId: string, fromIndex: number, toIndex: number) {
    setSections((sections) =>
      sections.map((section) => {
        if (section.id !== sectionId) {
          return section;
        }
        return {
          ...section,
          lessons: moveItem(section.lessons, fromIndex, toIndex),
        };
      })
    );
  }

  async function handleCreateSection() {
    const title = createSectionTitle.trim();
    if (!title) {
      setActionError({
        title: 'Thiếu dữ liệu',
        message: 'Tên section không được để trống.',
      });
      return;
    }

    begin('create-section');
    try {
      await createSection({
        body: { courseId, title },
        client: apiClient,
        path: { courseId },
        throwOnError: true,
      });
      setActionMessage('Section đã được tạo.');
      setCreateSectionTitle('');
      reload();
    } catch (error) {
      const problem = normalizeApiError(error);
      if (isUnimplemented(problem)) {
        setSections((sections) => [
          ...sections,
          {
            id: localId('section'),
            title,
            lessons: [],
          },
        ]);
        setActionMessage(
          'Create section chưa có ở backend, đã mock dữ liệu trên FE.'
        );
        setCreateSectionTitle('');
      } else {
        setActionError(problem);
      }
    } finally {
      end();
    }
  }

  async function handleRenameSection(sectionId: string) {
    const title = renamingSectionTitle.trim();
    if (!title) {
      setActionError({
        title: 'Thiếu dữ liệu',
        message: 'Tên section không được để trống.',
      });
      return;
    }

    begin(`rename-section-${sectionId}`);
    try {
      if (isLocalId(sectionId)) {
        setSections((sections) =>
          sections.map((section) =>
            section.id === sectionId ? { ...section, title } : section
          )
        );
      } else {
        await updateSectionTitle({
          body: { title },
          client: apiClient,
          path: { courseId, sectionId },
          throwOnError: true,
        });
        reload();
      }
      setActionMessage('Section đã được cập nhật.');
      setRenamingSectionId(null);
    } catch (error) {
      const problem = normalizeApiError(error);
      if (isUnimplemented(problem)) {
        setSections((sections) =>
          sections.map((section) =>
            section.id === sectionId ? { ...section, title } : section
          )
        );
        setActionMessage(
          'Update section chưa có ở backend, đã mock dữ liệu trên FE.'
        );
        setRenamingSectionId(null);
      } else {
        setActionError(problem);
      }
    } finally {
      end();
    }
  }

  async function handleDeleteSection(sectionId: string) {
    begin(`delete-section-${sectionId}`);
    try {
      if (isLocalId(sectionId)) {
        setSections((sections) => sections.filter((section) => section.id !== sectionId));
      } else {
        await deleteSection({
          client: apiClient,
          path: { courseId, sectionId },
          throwOnError: true,
        });
        reload();
      }
      setActionMessage('Section đã được xóa.');
    } catch (error) {
      const problem = normalizeApiError(error);
      if (isUnimplemented(problem)) {
        setSections((sections) => sections.filter((section) => section.id !== sectionId));
        setActionMessage(
          'Delete section chưa có ở backend, đã mock dữ liệu trên FE.'
        );
      } else {
        setActionError(problem);
      }
    } finally {
      end();
    }
  }

  async function handleMoveSection(sectionId: string, targetIndex: number) {
    const currentIndex = course.sections.findIndex((section) => section.id === sectionId);
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= course.sections.length) {
      return;
    }

    begin(`move-section-${sectionId}-${targetIndex}`);
    try {
      if (isLocalId(sectionId)) {
        setSections((sections) => moveItem(sections, currentIndex, targetIndex));
      } else {
        await moveSection({
          body: { order: targetIndex },
          client: apiClient,
          path: { courseId, sectionId },
          throwOnError: true,
        });
        reload();
      }
      setActionMessage('Section order đã được cập nhật.');
    } catch (error) {
      const problem = normalizeApiError(error);
      if (isUnimplemented(problem)) {
        setSections((sections) => moveItem(sections, currentIndex, targetIndex));
        setActionMessage(
          'Move section chưa có ở backend, đã mock dữ liệu trên FE.'
        );
      } else {
        setActionError(problem);
      }
    } finally {
      end();
    }
  }

  async function handleCreateLesson(sectionId: string) {
    const title = newLessonTitle.trim();
    if (!title) {
      setActionError({
        title: 'Thiếu dữ liệu',
        message: 'Tên lesson không được để trống.',
      });
      return;
    }

    const actionKey = `create-lesson-${sectionId}`;
    begin(actionKey);
    try {
      if (newLessonType === 'video') {
        const durationNumber = Number.parseInt(newLessonDuration, 10);
        if (!newLessonVideoKey.trim()) {
          setActionError({
            title: 'Thiếu dữ liệu',
            message: 'Video lesson cần video key.',
          });
          return;
        }
        if (!Number.isInteger(durationNumber) || durationNumber < 0) {
          setActionError({
            title: 'Sai dữ liệu',
            message: 'Duration phải là số nguyên không âm.',
          });
          return;
        }

        await createLesson({
          body: {
            lessonType: 'video',
            title,
            videoKey: newLessonVideoKey.trim(),
            duration: BigInt(durationNumber),
          },
          client: apiClient,
          path: { courseId, sectionId },
          throwOnError: true,
        });
      } else {
        await createLesson({
          body: {
            lessonType: 'test',
            title,
            questions: [],
          },
          client: apiClient,
          path: { courseId, sectionId },
          throwOnError: true,
        });
      }

      setActionMessage('Lesson đã được tạo.');
      setAddingLessonSectionId(null);
      setNewLessonTitle('');
      setNewLessonType('video');
      setNewLessonVideoKey('');
      setNewLessonDuration('0');
      reload();
    } catch (error) {
      const problem = normalizeApiError(error);
      if (isUnimplemented(problem)) {
        const id = localId('lesson');
        setSections((sections) =>
          sections.map((section) =>
            section.id === sectionId
              ? {
                ...section,
                lessons: [...section.lessons, { id, title }],
              }
              : section
          )
        );
        setLocalLessonMeta((current) => ({
          ...current,
          [id]: {
            lessonType: newLessonType,
            videoKey: newLessonType === 'video' ? newLessonVideoKey.trim() : undefined,
            duration: newLessonType === 'video' ? newLessonDuration : undefined,
            questions: newLessonType === 'test' ? [] : undefined,
          },
        }));
        setActionMessage(
          'Create lesson chưa có ở backend, đã mock dữ liệu trên FE.'
        );
        setAddingLessonSectionId(null);
        setNewLessonTitle('');
        setNewLessonType('video');
        setNewLessonVideoKey('');
        setNewLessonDuration('0');
      } else {
        setActionError(problem);
      }
    } finally {
      end();
    }
  }

  async function openLessonEditor(
    sectionId: string,
    lesson: CourseLesson,
    index: number
  ) {
    const key = lessonKey(sectionId, lesson, index);
    begin(`open-lesson-editor-${key}`);
    try {
      if (lesson.id && !isLocalId(lesson.id)) {
        const { data } = await getLessonDetail({
          client: apiClient,
          path: { courseId, sectionId, lessonId: lesson.id },
          throwOnError: true,
        });

        if (data.data.lessonType === 'video') {
          setLessonEditor({
            key,
            sectionId,
            lessonId: lesson.id,
            title: data.data.title,
            lessonType: 'video',
            videoKey: '',
            duration: data.data.duration.toString(),
            questions: [],
          });
        } else {
          setLessonEditor({
            key,
            sectionId,
            lessonId: lesson.id,
            title: data.data.title,
            lessonType: 'test',
            videoKey: '',
            duration: '0',
            questions: Array.isArray(data.data.questions) ? data.data.questions : [],
          });
        }
      } else {
        const meta = localLessonMeta[key] ?? localLessonMeta[lesson.id ?? ''];
        setLessonEditor({
          key,
          sectionId,
          lessonId: lesson.id,
          title: lesson.title,
          lessonType: meta?.lessonType ?? 'video',
          videoKey: meta?.videoKey ?? '',
          duration: meta?.duration ?? '0',
          questions: meta?.questions ?? [],
        });
      }

      setLessonEditorOpen(true);
    } catch (error) {
      setActionError(normalizeApiError(error));
    } finally {
      end();
    }
  }

  async function handleSaveLessonEdit() {
    if (!lessonEditor) {
      return;
    }
    const title = lessonEditor.title.trim();
    if (!title) {
      setActionError({
        title: 'Thiếu dữ liệu',
        message: 'Tên lesson không được để trống.',
      });
      return;
    }

    begin(`save-lesson-${lessonEditor.key}`);
    try {
      if (lessonEditor.lessonId && !isLocalId(lessonEditor.lessonId)) {
        if (lessonEditor.lessonType === 'video') {
          const durationNumber = Number.parseInt(lessonEditor.duration, 10);
          if (!Number.isInteger(durationNumber) || durationNumber < 0) {
            setActionError({
              title: 'Sai dữ liệu',
              message: 'Duration phải là số nguyên không âm.',
            });
            return;
          }
          await editVideoLesson({
            body: {
              title,
              duration: BigInt(durationNumber),
              ...(lessonEditor.videoKey.trim()
                ? { videoKey: lessonEditor.videoKey.trim() }
                : {}),
            },
            client: apiClient,
            path: {
              courseId,
              sectionId: lessonEditor.sectionId,
              lessonId: lessonEditor.lessonId,
            },
            throwOnError: true,
          });
        } else {
          await editTestLesson({
            body: {
              lessonType: 'test',
              title,
              questions: lessonEditor.questions,
            },
            client: apiClient,
            path: {
              courseId,
              sectionId: lessonEditor.sectionId,
              lessonId: lessonEditor.lessonId,
            },
            throwOnError: true,
          });
        }
        reload();
      } else {
        updateLessonTitle(lessonEditor.sectionId, lessonEditor.key, title);
        setLocalLessonMeta((current) => ({
          ...current,
          [lessonEditor.key]: {
            lessonType: lessonEditor.lessonType,
            videoKey:
              lessonEditor.lessonType === 'video'
                ? lessonEditor.videoKey.trim()
                : undefined,
            duration:
              lessonEditor.lessonType === 'video'
                ? lessonEditor.duration
                : undefined,
            questions:
              lessonEditor.lessonType === 'test'
                ? lessonEditor.questions
                : undefined,
          },
        }));
      }
      setActionMessage('Lesson đã được cập nhật.');
      setLessonEditorOpen(false);
      setLessonEditor(null);
    } catch (error) {
      const problem = normalizeApiError(error);
      if (isUnimplemented(problem)) {
        updateLessonTitle(lessonEditor.sectionId, lessonEditor.key, title);
        setLocalLessonMeta((current) => ({
          ...current,
          [lessonEditor.key]: {
            lessonType: lessonEditor.lessonType,
            videoKey:
              lessonEditor.lessonType === 'video'
                ? lessonEditor.videoKey.trim()
                : undefined,
            duration:
              lessonEditor.lessonType === 'video'
                ? lessonEditor.duration
                : undefined,
            questions:
              lessonEditor.lessonType === 'test'
                ? lessonEditor.questions
                : undefined,
          },
        }));
        setActionMessage(
          'Update lesson chưa có ở backend, đã mock dữ liệu trên FE.'
        );
        setLessonEditorOpen(false);
        setLessonEditor(null);
      } else {
        setActionError(problem);
      }
    } finally {
      end();
    }
  }

  async function handleMoveLesson(
    sectionId: string,
    lessonId: string | undefined,
    key: string,
    fromIndex: number,
    targetIndex: number
  ) {
    if (targetIndex < 0) {
      return;
    }
    const section = course.sections.find((item) => item.id === sectionId);
    if (!section || targetIndex >= section.lessons.length) {
      return;
    }

    begin(`move-lesson-${key}-${targetIndex}`);
    try {
      if (!lessonId || isLocalId(lessonId) || isLocalId(sectionId)) {
        moveLessonLocally(sectionId, fromIndex, targetIndex);
      } else {
        await moveLesson({
          body: {
            targetSectionId: sectionId,
            order: targetIndex,
          },
          client: apiClient,
          path: { courseId, sectionId, lessonId },
          throwOnError: true,
        });
        reload();
      }
      setActionMessage('Lesson order đã được cập nhật.');
    } catch (error) {
      const problem = normalizeApiError(error);
      if (isUnimplemented(problem)) {
        moveLessonLocally(sectionId, fromIndex, targetIndex);
        setActionMessage(
          'Move lesson chưa có ở backend, đã mock dữ liệu trên FE.'
        );
      } else {
        setActionError(problem);
      }
    } finally {
      end();
    }
  }

  async function handleDeleteLesson(
    sectionId: string,
    lessonId: string | undefined,
    key: string
  ) {
    begin(`delete-lesson-${key}`);
    try {
      if (!lessonId || isLocalId(lessonId) || isLocalId(sectionId)) {
        removeLesson(sectionId, key);
      } else {
        await deleteLesson({
          client: apiClient,
          path: { courseId, sectionId, lessonId },
          throwOnError: true,
        });
        reload();
      }
      setActionMessage('Lesson đã được xóa.');
      setLocalLessonMeta((current) => {
        const next = { ...current };
        delete next[key];
        if (lessonId) {
          delete next[lessonId];
        }
        return next;
      });
    } catch (error) {
      const problem = normalizeApiError(error);
      if (isUnimplemented(problem)) {
        removeLesson(sectionId, key);
        setActionMessage(
          'Delete lesson chưa có ở backend, đã mock dữ liệu trên FE.'
        );
        setLocalLessonMeta((current) => {
          const next = { ...current };
          delete next[key];
          if (lessonId) {
            delete next[lessonId];
          }
          return next;
        });
      } else {
        setActionError(problem);
      }
    } finally {
      end();
    }
  }

  return (
    <div className="grid gap-4">
      {actionMessage && <InlineNotice title="Success" description={actionMessage} />}
      {actionError && <ErrorState error={actionError} />}

      <Card className="bg-nm-bg">
        <CardHeader>
          <CardTitle>Create section</CardTitle>
        </CardHeader>
        <CardContent className="
          flex flex-col gap-3
          md:flex-row
        ">
          <Input
            placeholder="Ví dụ: Chương 1 - Khởi động"
            value={createSectionTitle}
            onChange={(event) => setCreateSectionTitle(event.target.value)}
          />
          <Button
            type="button"
            disabled={Boolean(busyAction)}
            onClick={handleCreateSection}
          >
            {busyAction === 'create-section' ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            Add section
          </Button>
        </CardContent>
      </Card>

      {!course.sections.length && (
        <Card className="bg-nm-bg">
          <CardContent className="py-8 text-sm text-slate-600">
            Chưa có section nào. Hãy tạo section đầu tiên.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {course.sections.map((section, sectionIndex) => {
          const isRenaming = renamingSectionId === section.id;
          const sectionBusy = busyAction?.includes(section.id ?? '') ?? false;
          const isAddingLesson = addingLessonSectionId === section.id;

          return (
            <Card key={section.id} className="bg-nm-bg">
              <CardHeader className="gap-3">
                <div className="
                  flex flex-wrap items-center justify-between gap-2
                ">
                  <CardTitle className="text-lg">
                    Section {sectionIndex + 1}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={sectionIndex === 0 || sectionBusy}
                      onClick={() => handleMoveSection(section.id, sectionIndex - 1)}
                    >
                      <ArrowUp className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={
                        sectionIndex === course.sections.length - 1 || sectionBusy
                      }
                      onClick={() => handleMoveSection(section.id, sectionIndex + 1)}
                    >
                      <ArrowDown className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={sectionBusy}
                      onClick={() => {
                        setRenamingSectionId(section.id);
                        setRenamingSectionTitle(section.title);
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={sectionBusy}
                      onClick={() => handleDeleteSection(section.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
                {isRenaming ? (
                  <div className="
                    flex flex-col gap-2
                    md:flex-row
                  ">
                    <Input
                      value={renamingSectionTitle}
                      onChange={(event) =>
                        setRenamingSectionTitle(event.target.value)
                      }
                    />
                    <Button
                      type="button"
                      size="sm"
                      disabled={Boolean(busyAction)}
                      onClick={() => handleRenameSection(section.id)}
                    >
                      <Save className="size-4" />
                      Save title
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={Boolean(busyAction)}
                      onClick={() => {
                        setRenamingSectionId(null);
                        setRenamingSectionTitle('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="text-sm font-medium text-slate-700">
                    {section.title}
                  </div>
                )}
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    {section.lessons.length} lesson(s)
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={sectionBusy}
                    onClick={() => {
                      setAddingLessonSectionId(
                        isAddingLesson ? null : section.id
                      );
                      setNewLessonTitle('');
                      setNewLessonType('video');
                      setNewLessonVideoKey('');
                      setNewLessonDuration('0');
                    }}
                  >
                    <FilePlus2 className="size-4" />
                    Add lesson
                  </Button>
                </div>

                {isAddingLesson && (
                  <div className="
                    grid gap-2 rounded-xl border border-dashed p-3
                  ">
                    <Input
                      placeholder="Tên lesson"
                      value={newLessonTitle}
                      onChange={(event) => setNewLessonTitle(event.target.value)}
                    />
                    <div className="
                      grid gap-2
                      md:grid-cols-[220px_1fr_160px]
                    ">
                      <select
                        className="
                          h-10 rounded-xl border bg-background px-3 text-sm
                        "
                        value={newLessonType}
                        onChange={(event) =>
                          setNewLessonType(event.target.value as 'video' | 'test')
                        }
                      >
                        <option value="video">Video lesson</option>
                        <option value="test">Test lesson</option>
                      </select>
                      {newLessonType === 'video' && (
                        <>
                          <Input
                            placeholder="video key (videos/lesson-1.mp4)"
                            value={newLessonVideoKey}
                            onChange={(event) =>
                              setNewLessonVideoKey(event.target.value)
                            }
                          />
                          <Input
                            inputMode="numeric"
                            min={0}
                            step={1}
                            type="number"
                            placeholder="duration (s)"
                            value={newLessonDuration}
                            onChange={(event) =>
                              setNewLessonDuration(event.target.value)
                            }
                          />
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        disabled={Boolean(busyAction)}
                        onClick={() => handleCreateLesson(section.id)}
                      >
                        {busyAction === `create-lesson-${section.id}` ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Save className="size-4" />
                        )}
                        Save lesson
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={Boolean(busyAction)}
                        onClick={() => setAddingLessonSectionId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {!section.lessons.length && (
                  <div className="
                    rounded-lg border border-dashed p-4 text-sm text-slate-500
                  ">
                    Section này chưa có lesson.
                  </div>
                )}

                {section.lessons.map((lesson, lessonIndex) => {
                  const key = lessonKey(section.id, lesson, lessonIndex);
                  const lessonBusy = busyAction?.includes(key) ?? false;
                  return (
                    <div
                      key={key}
                      className="
                        flex flex-wrap items-center justify-between gap-3
                        rounded-lg border px-3 py-2
                      "
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium">{lesson.title}</div>
                        <div className="text-xs text-slate-500">
                          Lesson {lessonIndex + 1}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={lessonIndex === 0 || lessonBusy}
                          onClick={() =>
                            handleMoveLesson(
                              section.id,
                              lesson.id,
                              key,
                              lessonIndex,
                              lessonIndex - 1
                            )
                          }
                        >
                          <ArrowUp className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={
                            lessonIndex === section.lessons.length - 1 || lessonBusy
                          }
                          onClick={() =>
                            handleMoveLesson(
                              section.id,
                              lesson.id,
                              key,
                              lessonIndex,
                              lessonIndex + 1
                            )
                          }
                        >
                          <ArrowDown className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={lessonBusy}
                          onClick={() => openLessonEditor(section.id, lesson, lessonIndex)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          disabled={lessonBusy}
                          onClick={() =>
                            handleDeleteLesson(section.id, lesson.id, key)
                          }
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog
        open={lessonEditorOpen}
        onOpenChange={(open) => {
          setLessonEditorOpen(open);
          if (!open) {
            setLessonEditor(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit lesson</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin lesson theo loại video/test.
            </DialogDescription>
          </DialogHeader>
          {lessonEditor && (
            <div className="grid gap-3">
              <Input
                placeholder="Lesson title"
                value={lessonEditor.title}
                onChange={(event) =>
                  setLessonEditor((current) =>
                    current
                      ? {
                        ...current,
                        title: event.target.value,
                      }
                      : current
                  )
                }
              />
              <Input value={lessonEditor.lessonType} disabled />
              {lessonEditor.lessonType === 'video' && (
                <div className="grid gap-2">
                  <Input
                    placeholder="Video key (optional)"
                    value={lessonEditor.videoKey}
                    onChange={(event) =>
                      setLessonEditor((current) =>
                        current
                          ? {
                            ...current,
                            videoKey: event.target.value,
                          }
                          : current
                      )
                    }
                  />
                  <Input
                    inputMode="numeric"
                    min={0}
                    step={1}
                    type="number"
                    placeholder="Duration (seconds)"
                    value={lessonEditor.duration}
                    onChange={(event) =>
                      setLessonEditor((current) =>
                        current
                          ? {
                            ...current,
                            duration: event.target.value,
                          }
                          : current
                      )
                    }
                  />
                </div>
              )}
              {lessonEditor.lessonType === 'test' && (
                <div className="text-xs text-slate-500">
                  Test lesson đang giữ nguyên danh sách questions hiện có từ backend.
                </div>
              )}
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={Boolean(busyAction)}
                  onClick={() => {
                    setLessonEditorOpen(false);
                    setLessonEditor(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={Boolean(busyAction)}
                  onClick={handleSaveLessonEdit}
                >
                  {busyAction?.startsWith('save-lesson-') ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Save lesson
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

