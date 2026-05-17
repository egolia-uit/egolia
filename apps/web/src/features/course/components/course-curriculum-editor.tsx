'use client';

import {
  ArrowDown,
  ArrowUp,
  FilePenLine,
  Loader2,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '#/components/ui/neumorphism/badge';
import { Button } from '#/components/ui/neumorphism/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/neumorphism/card';
import { Checkbox } from '#/components/ui/neumorphism/checkbox';
import { Input } from '#/components/ui/neumorphism/input';
import {
  RadioGroup,
  RadioGroupItem,
} from '#/components/ui/neumorphism/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/shadcn/dialog';
import { Label } from '#/components/ui/shadcn/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/shadcn/select';
import { Separator } from '#/components/ui/shadcn/separator';
import { apiClient } from '#/lib/api';
import {
  type CourseCourseDetail,
  type CourseLesson,
  createLesson,
  deleteLesson,
  deleteSection,
  editVideoLesson,
  getLessonDetail,
  moveLesson,
  moveSection,
  updateSectionTitle,
} from '#/lib/api/course';
import { type ApiProblem, normalizeApiError } from '#/lib/api/errors';

import { ErrorState, InlineNotice } from './course-states';

type QuestionType = 'singleChoice' | 'multipleChoice';

type LessonAnswerDraft = {
  id: string;
  content: string;
  isCorrect: boolean;
};

type LessonQuestionDraft = {
  id: string;
  question: string;
  answers: LessonAnswerDraft[];
};

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
  questionType: QuestionType;
  videoKey: string;
  duration: string;
  questions: LessonQuestionDraft[];
};

type LocalLessonMeta = {
  lessonType: 'video' | 'test';
  questionType?: QuestionType;
  videoKey?: string;
  duration?: string;
  questions?: LessonQuestionDraft[];
};

type TestQuestionBuilderProps = {
  disabled?: boolean;
  questionType: QuestionType;
  questions: LessonQuestionDraft[];
  onQuestionTypeChange: (value: QuestionType) => void;
  onAddQuestion: () => void;
  onRemoveQuestion: (questionId: string) => void;
  onQuestionChange: (questionId: string, value: string) => void;
  onAddAnswer: (questionId: string) => void;
  onRemoveAnswer: (questionId: string, answerId: string) => void;
  onAnswerChange: (questionId: string, answerId: string, value: string) => void;
  onAnswerCorrectChange: (
    questionId: string,
    answerId: string,
    checked: boolean
  ) => void;
};

const authSecurity = [
  { scheme: 'bearer', type: 'http' },
  { scheme: 'bearer', type: 'http' },
] as const;

const DEFAULT_QUESTION_TYPE: QuestionType = 'singleChoice';

function isUnimplemented(problem: ApiProblem) {
  return problem.status === 501 || problem.code === 'unimplemented';
}

function isLocalId(value?: string) {
  return Boolean(value?.startsWith('local-'));
}

function createUuid() {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }
  const suffix = Math.random()
    .toString(16)
    .slice(2)
    .padEnd(12, '0')
    .slice(0, 12);
  return `00000000-0000-4000-8000-${suffix}`;
}

function localId(prefix: 'section' | 'lesson') {
  return `local-${prefix}-${createUuid()}`;
}

function createAnswerDraft(content = '', isCorrect = false): LessonAnswerDraft {
  return { id: createUuid(), content, isCorrect };
}

function createQuestionDraft(questionType: QuestionType): LessonQuestionDraft {
  return {
    id: createUuid(),
    question: '',
    answers: [
      createAnswerDraft('', true),
      createAnswerDraft('', questionType === 'multipleChoice'),
    ],
  };
}

function cloneQuestions(questions: LessonQuestionDraft[]) {
  return questions.map((question) => ({
    ...question,
    answers: question.answers.map((answer) => ({ ...answer })),
  }));
}

function toQuestionType(value: unknown): QuestionType {
  return value === 'multipleChoice' ? 'multipleChoice' : 'singleChoice';
}

function normalizeQuestionForType(
  question: LessonQuestionDraft,
  questionType: QuestionType
) {
  const answers =
    question.answers.length > 0
      ? question.answers.map((answer) => ({ ...answer }))
      : [createAnswerDraft('', true), createAnswerDraft('', false)];

  if (questionType === 'singleChoice') {
    const firstCorrect = answers.findIndex((answer) => answer.isCorrect);
    const keepIndex = firstCorrect >= 0 ? firstCorrect : 0;
    return {
      ...question,
      answers: answers.map((answer, index) => ({
        ...answer,
        isCorrect: index === keepIndex,
      })),
    };
  }

  if (!answers.some((answer) => answer.isCorrect)) {
    answers[0] = { ...answers[0], isCorrect: true };
  }

  return { ...question, answers };
}

function normalizeQuestionsForType(
  questions: LessonQuestionDraft[],
  questionType: QuestionType
) {
  if (!questions.length) {
    return [createQuestionDraft(questionType)];
  }
  return questions.map((question) =>
    normalizeQuestionForType(question, questionType)
  );
}

function parseQuestions(
  raw: unknown,
  questionType: QuestionType
): LessonQuestionDraft[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return [createQuestionDraft(questionType)];
  }

  const parsed: LessonQuestionDraft[] = raw.map((item) => {
    const record =
      typeof item === 'object' && item !== null
        ? (item as Record<string, unknown>)
        : {};
    const rawAnswers = Array.isArray(record.answers) ? record.answers : [];

    const answers = rawAnswers
      .map((answer) => {
        const answerRecord =
          typeof answer === 'object' && answer !== null
            ? (answer as Record<string, unknown>)
            : {};
        return {
          id:
            typeof answerRecord.id === 'string'
              ? answerRecord.id
              : createUuid(),
          content:
            typeof answerRecord.content === 'string'
              ? answerRecord.content
              : '',
          isCorrect: answerRecord.isCorrect === true,
        };
      })
      .filter((answer) => typeof answer.content === 'string');

    return {
      id: typeof record.id === 'string' ? record.id : createUuid(),
      question: typeof record.question === 'string' ? record.question : '',
      answers:
        answers.length > 0
          ? answers
          : [createAnswerDraft('', true), createAnswerDraft('', false)],
    };
  });

  return normalizeQuestionsForType(parsed, questionType);
}

function validateTestQuestions(
  questionType: QuestionType,
  questions: LessonQuestionDraft[]
): string | null {
  if (!questions.length) {
    return 'Test lesson cần ít nhất 1 câu hỏi.';
  }

  for (
    let questionIndex = 0;
    questionIndex < questions.length;
    questionIndex += 1
  ) {
    const question = questions[questionIndex];
    if (!question.question.trim()) {
      return `Câu hỏi ${questionIndex + 1} chưa có nội dung.`;
    }
    if (question.answers.length < 2) {
      return `Câu hỏi ${questionIndex + 1} cần ít nhất 2 đáp án.`;
    }

    for (
      let answerIndex = 0;
      answerIndex < question.answers.length;
      answerIndex += 1
    ) {
      if (!question.answers[answerIndex].content.trim()) {
        return `Đáp án ${answerIndex + 1} của câu hỏi ${questionIndex + 1} đang trống.`;
      }
    }

    const correctCount = question.answers.filter(
      (answer) => answer.isCorrect
    ).length;
    if (questionType === 'singleChoice' && correctCount !== 1) {
      return `Câu hỏi ${questionIndex + 1} phải có đúng 1 đáp án đúng.`;
    }
    if (questionType === 'multipleChoice' && correctCount < 1) {
      return `Câu hỏi ${questionIndex + 1} cần ít nhất 1 đáp án đúng.`;
    }
  }

  return null;
}

function toApiQuestions(questions: LessonQuestionDraft[]) {
  return questions.map((question) => ({
    question: question.question.trim(),
    answers: question.answers.map((answer) => ({
      content: answer.content.trim(),
      isCorrect: answer.isCorrect,
    })),
  }));
}

function moveItem<T>(items: T[], from: number, to: number) {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= items.length ||
    to >= items.length
  ) {
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

function updateQuestionText(
  questions: LessonQuestionDraft[],
  questionId: string,
  value: string
) {
  return questions.map((question) =>
    question.id === questionId ? { ...question, question: value } : question
  );
}

function addAnswer(questions: LessonQuestionDraft[], questionId: string) {
  return questions.map((question) =>
    question.id === questionId
      ? {
          ...question,
          answers: [...question.answers, createAnswerDraft('', false)],
        }
      : question
  );
}

function removeAnswer(
  questions: LessonQuestionDraft[],
  questionType: QuestionType,
  questionId: string,
  answerId: string
) {
  return questions.map((question) => {
    if (question.id !== questionId || question.answers.length <= 2) {
      return question;
    }
    const nextAnswers = question.answers.filter(
      (answer) => answer.id !== answerId
    );
    return normalizeQuestionForType(
      { ...question, answers: nextAnswers },
      questionType
    );
  });
}

function updateAnswerContent(
  questions: LessonQuestionDraft[],
  questionId: string,
  answerId: string,
  value: string
) {
  return questions.map((question) =>
    question.id === questionId
      ? {
          ...question,
          answers: question.answers.map((answer) =>
            answer.id === answerId ? { ...answer, content: value } : answer
          ),
        }
      : question
  );
}

function updateAnswerCorrect(
  questions: LessonQuestionDraft[],
  questionType: QuestionType,
  questionId: string,
  answerId: string,
  checked: boolean
) {
  return questions.map((question) => {
    if (question.id !== questionId) {
      return question;
    }

    if (questionType === 'singleChoice') {
      return {
        ...question,
        answers: question.answers.map((answer) => ({
          ...answer,
          isCorrect: answer.id === answerId,
        })),
      };
    }

    return {
      ...question,
      answers: question.answers.map((answer) =>
        answer.id === answerId ? { ...answer, isCorrect: checked } : answer
      ),
    };
  });
}

async function createSectionRequest(courseId: string, title: string) {
  return apiClient.post({
    body: { title },
    headers: { 'Content-Type': 'application/json' },
    path: { courseId },
    security: authSecurity,
    throwOnError: true,
    url: '/course/courses/{courseId}/sections',
  });
}

async function createTestLessonRequest({
  courseId,
  sectionId,
  title,
  questionType,
  questions,
}: {
  courseId: string;
  sectionId: string;
  title: string;
  questionType: QuestionType;
  questions: ReturnType<typeof toApiQuestions>;
}) {
  return apiClient.post({
    body: { lessonType: 'test', questionType, questions, title },
    headers: { 'Content-Type': 'application/json' },
    path: { courseId, sectionId },
    security: authSecurity,
    throwOnError: true,
    url: '/course/courses/{courseId}/sections/{sectionId}/lessons',
  });
}

async function editTestLessonRequest({
  courseId,
  sectionId,
  lessonId,
  title,
  questionType,
  questions,
}: {
  courseId: string;
  sectionId: string;
  lessonId: string;
  title: string;
  questionType: QuestionType;
  questions: ReturnType<typeof toApiQuestions>;
}) {
  return apiClient.put({
    body: { lessonType: 'test', questionType, questions, title },
    headers: { 'Content-Type': 'application/json' },
    path: { courseId, lessonId, sectionId },
    security: authSecurity,
    throwOnError: true,
    url: '/course/courses/{courseId}/sections/{sectionId}/lessons/{lessonId}/test',
  });
}

function TestQuestionBuilder({
  disabled = false,
  questionType,
  questions,
  onQuestionTypeChange,
  onAddQuestion,
  onRemoveQuestion,
  onQuestionChange,
  onAddAnswer,
  onRemoveAnswer,
  onAnswerChange,
  onAnswerCorrectChange,
}: TestQuestionBuilderProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-white/55 bg-nm-bg/75 p-4 shadow-nm-inset">
      <div className="grid gap-2 md:grid-cols-[220px_1fr] md:items-center">
        <div className="space-y-1">
          <Label>Question type</Label>
          <p className="text-xs text-slate-500">
            `Single choice` dùng radio, `Multiple choice` dùng checkbox.
          </p>
        </div>
        <Select
          disabled={disabled}
          value={questionType}
          onValueChange={(value) => onQuestionTypeChange(value as QuestionType)}
        >
          <SelectTrigger
            className="
              h-10 w-full rounded-xl border-none bg-nm-bg px-4 shadow-nm-inset
              focus-visible:ring-2 focus-visible:ring-ring
            "
          >
            <SelectValue placeholder="Chọn kiểu câu hỏi" />
          </SelectTrigger>
          <SelectContent className="border-none bg-nm-bg shadow-nm-flat">
            <SelectItem
              className="
                rounded-lg
                data-[highlighted]:bg-nm-bg data-[highlighted]:shadow-nm-inset
              "
              value="singleChoice"
            >
              Single choice
            </SelectItem>
            <SelectItem
              className="
                rounded-lg
                data-[highlighted]:bg-nm-bg data-[highlighted]:shadow-nm-inset
              "
              value="multipleChoice"
            >
              Multiple choice
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator className="bg-slate-300/60" />

      <div className="space-y-3">
        {questions.map((question, questionIndex) => {
          const selectedAnswerId =
            question.answers.find((answer) => answer.isCorrect)?.id ?? '';

          return (
            <Card
              key={question.id}
              className="
                border border-white/55 bg-nm-bg/85 py-3 shadow-nm-flat-sm
              "
            >
              <CardHeader className="px-3 pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-sm">
                    Question {questionIndex + 1}
                  </CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={disabled || questions.length <= 1}
                    onClick={() => onRemoveQuestion(question.id)}
                  >
                    <Trash2 className="size-4" />
                    Remove
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 px-3">
                <div className="space-y-1">
                  <Label htmlFor={`question-${question.id}`}>
                    Question content
                  </Label>
                  <Input
                    id={`question-${question.id}`}
                    disabled={disabled}
                    placeholder="Ví dụ: OOP principle nào dùng để ẩn chi tiết triển khai?"
                    value={question.question}
                    onChange={(event) =>
                      onQuestionChange(question.id, event.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Answers</Label>
                  {questionType === 'singleChoice' ? (
                    <RadioGroup
                      className="space-y-2"
                      disabled={disabled}
                      value={selectedAnswerId}
                      onValueChange={(value) =>
                        onAnswerCorrectChange(question.id, value, true)
                      }
                    >
                      {question.answers.map((answer, answerIndex) => (
                        <div
                          key={answer.id}
                          className="
                            grid grid-cols-[auto_1fr_auto] items-center gap-2
                          "
                        >
                          <RadioGroupItem
                            id={`single-answer-${answer.id}`}
                            value={answer.id}
                          />
                          <Input
                            placeholder={`Answer ${answerIndex + 1}`}
                            value={answer.content}
                            onChange={(event) =>
                              onAnswerChange(
                                question.id,
                                answer.id,
                                event.target.value
                              )
                            }
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            disabled={disabled || question.answers.length <= 2}
                            onClick={() =>
                              onRemoveAnswer(question.id, answer.id)
                            }
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <div className="space-y-2">
                      {question.answers.map((answer, answerIndex) => (
                        <div
                          key={answer.id}
                          className="
                            grid grid-cols-[auto_1fr_auto] items-center gap-2
                          "
                        >
                          <Checkbox
                            checked={answer.isCorrect}
                            disabled={disabled}
                            onCheckedChange={(checked) =>
                              onAnswerCorrectChange(
                                question.id,
                                answer.id,
                                checked === true
                              )
                            }
                          />
                          <Input
                            placeholder={`Answer ${answerIndex + 1}`}
                            value={answer.content}
                            onChange={(event) =>
                              onAnswerChange(
                                question.id,
                                answer.id,
                                event.target.value
                              )
                            }
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            disabled={disabled || question.answers.length <= 2}
                            onClick={() =>
                              onRemoveAnswer(question.id, answer.id)
                            }
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled}
                  className="gap-1.5"
                  onClick={() => onAddAnswer(question.id)}
                >
                  <Plus className="size-4" />
                  Add answer
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={disabled}
        className="gap-1.5"
        onClick={onAddQuestion}
      >
        <Plus className="size-4" />
        Add question
      </Button>
    </div>
  );
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
  const [renamingSectionId, setRenamingSectionId] = useState<string | null>(
    null
  );
  const [renamingSectionTitle, setRenamingSectionTitle] = useState('');

  const [addingLessonSectionId, setAddingLessonSectionId] = useState<
    string | null
  >(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonType, setNewLessonType] = useState<'video' | 'test'>('video');
  const [newLessonQuestionType, setNewLessonQuestionType] =
    useState<QuestionType>(DEFAULT_QUESTION_TYPE);
  const [newLessonQuestions, setNewLessonQuestions] = useState<
    LessonQuestionDraft[]
  >([createQuestionDraft(DEFAULT_QUESTION_TYPE)]);
  const [newLessonVideoKey, setNewLessonVideoKey] = useState('');
  const [newLessonDuration, setNewLessonDuration] = useState('0');

  const [lessonEditor, setLessonEditor] = useState<LessonEditorState | null>(
    null
  );
  const [lessonEditorOpen, setLessonEditorOpen] = useState(false);
  const [localLessonMeta, setLocalLessonMeta] = useState<
    Record<string, LocalLessonMeta>
  >({});

  function begin(actionKey: string) {
    setBusyAction(actionKey);
    setActionError(null);
    setActionMessage(null);
  }

  function end() {
    setBusyAction(null);
  }

  function setSections(
    updater: (
      sections: CourseCourseDetail['sections']
    ) => CourseCourseDetail['sections']
  ) {
    setCourse((current) => ({
      ...current,
      sections: updater(current.sections),
    }));
  }

  function resetLessonForm() {
    setNewLessonTitle('');
    setNewLessonType('video');
    setNewLessonQuestionType(DEFAULT_QUESTION_TYPE);
    setNewLessonQuestions([createQuestionDraft(DEFAULT_QUESTION_TYPE)]);
    setNewLessonVideoKey('');
    setNewLessonDuration('0');
  }

  function updateLessonTitle(sectionId: string, key: string, title: string) {
    setSections((sections) =>
      sections.map((section) => {
        if (section.id !== sectionId) {
          return section;
        }
        return {
          ...section,
          lessons: section.lessons.map((lesson, lessonIndex) =>
            lessonKey(sectionId, lesson, lessonIndex) === key
              ? { ...lesson, title }
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
            (lesson, lessonIndex) =>
              lessonKey(sectionId, lesson, lessonIndex) !== key
          ),
        };
      })
    );
  }

  function moveLessonLocally(
    sectionId: string,
    fromIndex: number,
    toIndex: number
  ) {
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

  function updateLessonEditorQuestions(
    updater: (questions: LessonQuestionDraft[]) => LessonQuestionDraft[]
  ) {
    setLessonEditor((current) => {
      if (!current || current.lessonType !== 'test') {
        return current;
      }
      return { ...current, questions: updater(current.questions) };
    });
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
      await createSectionRequest(courseId, title);
      setActionMessage('Section đã được tạo.');
      setCreateSectionTitle('');
      reload();
    } catch (error) {
      const problem = normalizeApiError(error);
      if (isUnimplemented(problem)) {
        setSections((sections) => [
          ...sections,
          { id: localId('section'), title, lessons: [] },
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
      setRenamingSectionTitle('');
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
        setRenamingSectionTitle('');
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
        setSections((sections) =>
          sections.filter((section) => section.id !== sectionId)
        );
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
        setSections((sections) =>
          sections.filter((section) => section.id !== sectionId)
        );
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
    const currentIndex = course.sections.findIndex(
      (section) => section.id === sectionId
    );
    if (
      currentIndex < 0 ||
      targetIndex < 0 ||
      targetIndex >= course.sections.length
    ) {
      return;
    }

    begin(`move-section-${sectionId}-${targetIndex}`);
    try {
      if (isLocalId(sectionId)) {
        setSections((sections) =>
          moveItem(sections, currentIndex, targetIndex)
        );
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
        setSections((sections) =>
          moveItem(sections, currentIndex, targetIndex)
        );
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

    begin(`create-lesson-${sectionId}`);
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
        const validationError = validateTestQuestions(
          newLessonQuestionType,
          newLessonQuestions
        );
        if (validationError) {
          setActionError({
            title: 'Sai dữ liệu',
            message: validationError,
          });
          return;
        }
        await createTestLessonRequest({
          courseId,
          sectionId,
          title,
          questionType: newLessonQuestionType,
          questions: toApiQuestions(newLessonQuestions),
        });
      }

      setActionMessage('Lesson đã được tạo.');
      setAddingLessonSectionId(null);
      resetLessonForm();
      reload();
    } catch (error) {
      const problem = normalizeApiError(error);
      if (isUnimplemented(problem)) {
        const id = localId('lesson');
        setSections((sections) =>
          sections.map((section) =>
            section.id === sectionId
              ? { ...section, lessons: [...section.lessons, { id, title }] }
              : section
          )
        );
        setLocalLessonMeta((current) => ({
          ...current,
          [id]: {
            lessonType: newLessonType,
            questionType:
              newLessonType === 'test' ? newLessonQuestionType : undefined,
            videoKey:
              newLessonType === 'video' ? newLessonVideoKey.trim() : undefined,
            duration: newLessonType === 'video' ? newLessonDuration : undefined,
            questions:
              newLessonType === 'test'
                ? cloneQuestions(newLessonQuestions)
                : undefined,
          },
        }));
        setActionMessage(
          'Create lesson chưa có ở backend, đã mock dữ liệu trên FE.'
        );
        setAddingLessonSectionId(null);
        resetLessonForm();
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
      const persistedMeta =
        localLessonMeta[lesson.id ?? ''] ?? localLessonMeta[key];
      if (persistedMeta) {
        setLessonEditor({
          key,
          sectionId,
          lessonId: lesson.id,
          title: lesson.title,
          lessonType: persistedMeta.lessonType,
          questionType: persistedMeta.questionType ?? DEFAULT_QUESTION_TYPE,
          videoKey: persistedMeta.videoKey ?? '',
          duration: persistedMeta.duration ?? '0',
          questions: cloneQuestions(
            persistedMeta.questions ?? [
              createQuestionDraft(DEFAULT_QUESTION_TYPE),
            ]
          ),
        });
        setLessonEditorOpen(true);
        return;
      }

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
            questionType: DEFAULT_QUESTION_TYPE,
            videoKey: '',
            duration: data.data.duration.toString(),
            questions: [],
          });
        } else {
          const questionType = toQuestionType(data.data.questionType);
          setLessonEditor({
            key,
            sectionId,
            lessonId: lesson.id,
            title: data.data.title,
            lessonType: 'test',
            questionType,
            videoKey: '',
            duration: '0',
            questions: parseQuestions(data.data.questions, questionType),
          });
        }
      } else {
        setLessonEditor({
          key,
          sectionId,
          lessonId: lesson.id,
          title: lesson.title,
          lessonType: 'video',
          questionType: DEFAULT_QUESTION_TYPE,
          videoKey: '',
          duration: '0',
          questions: [createQuestionDraft(DEFAULT_QUESTION_TYPE)],
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
          const validationError = validateTestQuestions(
            lessonEditor.questionType,
            lessonEditor.questions
          );
          if (validationError) {
            setActionError({
              title: 'Sai dữ liệu',
              message: validationError,
            });
            return;
          }

          await editTestLessonRequest({
            courseId,
            sectionId: lessonEditor.sectionId,
            lessonId: lessonEditor.lessonId,
            title,
            questionType: lessonEditor.questionType,
            questions: toApiQuestions(lessonEditor.questions),
          });
        }

        reload();
      } else {
        updateLessonTitle(lessonEditor.sectionId, lessonEditor.key, title);
      }

      setLocalLessonMeta((current) => ({
        ...current,
        [lessonEditor.lessonId ?? lessonEditor.key]: {
          lessonType: lessonEditor.lessonType,
          questionType:
            lessonEditor.lessonType === 'test'
              ? lessonEditor.questionType
              : undefined,
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
              ? cloneQuestions(lessonEditor.questions)
              : undefined,
        },
      }));

      setActionMessage('Lesson đã được cập nhật.');
      setLessonEditorOpen(false);
      setLessonEditor(null);
    } catch (error) {
      const problem = normalizeApiError(error);
      if (isUnimplemented(problem)) {
        updateLessonTitle(lessonEditor.sectionId, lessonEditor.key, title);
        setLocalLessonMeta((current) => ({
          ...current,
          [lessonEditor.lessonId ?? lessonEditor.key]: {
            lessonType: lessonEditor.lessonType,
            questionType:
              lessonEditor.lessonType === 'test'
                ? lessonEditor.questionType
                : undefined,
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
                ? cloneQuestions(lessonEditor.questions)
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
          body: { targetSectionId: sectionId, order: targetIndex },
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

      setLocalLessonMeta((current) => {
        const next = { ...current };
        delete next[key];
        if (lessonId) {
          delete next[lessonId];
        }
        return next;
      });
      setActionMessage('Lesson đã được xóa.');
    } catch (error) {
      const problem = normalizeApiError(error);
      if (isUnimplemented(problem)) {
        removeLesson(sectionId, key);
        setLocalLessonMeta((current) => {
          const next = { ...current };
          delete next[key];
          if (lessonId) {
            delete next[lessonId];
          }
          return next;
        });
        setActionMessage(
          'Delete lesson chưa có ở backend, đã mock dữ liệu trên FE.'
        );
      } else {
        setActionError(problem);
      }
    } finally {
      end();
    }
  }

  return (
    <div className="grid gap-4">
      {actionMessage && (
        <InlineNotice title="Success" description={actionMessage} />
      )}
      {actionError && <ErrorState error={actionError} />}

      <Card className="border border-white/55 bg-nm-bg/90 py-4 shadow-nm-flat-sm">
        <CardHeader>
          <CardTitle>Create section</CardTitle>
          <CardDescription>
            Tạo chương mới cho khóa học trước khi thêm lesson.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[1fr_auto]">
          <Input
            placeholder="Ví dụ: Chương 1 - Khởi động"
            value={createSectionTitle}
            onChange={(event) => setCreateSectionTitle(event.target.value)}
          />
          <Button
            type="button"
            className="gap-1.5"
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
        <Card className="border border-dashed border-white/60 py-6">
          <CardContent className="text-sm text-slate-500">
            Chưa có section nào. Hãy tạo section đầu tiên.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {course.sections.map((section, sectionIndex) => {
          const isRenaming = renamingSectionId === section.id;
          const isSectionBusy = busyAction?.includes(section.id ?? '') ?? false;
          const isAddingLesson = addingLessonSectionId === section.id;

          return (
            <Card
              key={section.id}
              className="border border-white/55 bg-nm-bg/90 py-4 shadow-nm-flat-sm"
            >
              <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        Section {sectionIndex + 1}
                      </Badge>
                      <CardTitle className="text-base">
                        {section.title}
                      </CardTitle>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      disabled={sectionIndex === 0 || isSectionBusy}
                      onClick={() =>
                        handleMoveSection(section.id, sectionIndex - 1)
                      }
                    >
                      <ArrowUp className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      disabled={
                        sectionIndex === course.sections.length - 1 ||
                        isSectionBusy
                      }
                      onClick={() =>
                        handleMoveSection(section.id, sectionIndex + 1)
                      }
                    >
                      <ArrowDown className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      disabled={isSectionBusy}
                      onClick={() => {
                        setRenamingSectionId(section.id);
                        setRenamingSectionTitle(section.title);
                      }}
                    >
                      <FilePenLine className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon-sm"
                      disabled={isSectionBusy}
                      onClick={() => handleDeleteSection(section.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>

                {isRenaming && (
                  <div
                    className="
                      grid gap-2 rounded-2xl border border-white/50 bg-nm-bg/70
                      p-3 shadow-nm-inset
                      md:grid-cols-[1fr_auto_auto]
                    "
                  >
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
                      Save
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
                )}
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-slate-500">
                    {section.lessons.length} lesson(s)
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    disabled={isSectionBusy}
                    onClick={() => {
                      setAddingLessonSectionId(
                        isAddingLesson ? null : section.id
                      );
                      resetLessonForm();
                    }}
                  >
                    <Plus className="size-4" />
                    Add lesson
                  </Button>
                </div>

                {isAddingLesson && (
                  <div className="space-y-4 rounded-2xl border border-white/55 bg-nm-bg/75 p-4 shadow-nm-inset">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1">
                        <Label htmlFor={`new-lesson-title-${section.id}`}>
                          Lesson title
                        </Label>
                        <Input
                          id={`new-lesson-title-${section.id}`}
                          placeholder="Tên lesson"
                          value={newLessonTitle}
                          onChange={(event) =>
                            setNewLessonTitle(event.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Lesson type</Label>
                        <Select
                          value={newLessonType}
                          onValueChange={(value) =>
                            setNewLessonType(value as 'video' | 'test')
                          }
                        >
                          <SelectTrigger className="h-10 w-full rounded-xl border-none bg-nm-bg px-4 shadow-nm-inset focus-visible:ring-2 focus-visible:ring-ring">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="border-none bg-nm-bg shadow-nm-flat">
                            <SelectItem
                              className="
                                rounded-lg
                                data-[highlighted]:bg-nm-bg
                                data-[highlighted]:shadow-nm-inset
                              "
                              value="video"
                            >
                              Video lesson
                            </SelectItem>
                            <SelectItem
                              className="
                                rounded-lg
                                data-[highlighted]:bg-nm-bg
                                data-[highlighted]:shadow-nm-inset
                              "
                              value="test"
                            >
                              Test lesson
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {newLessonType === 'video' ? (
                      <div className="grid gap-3 md:grid-cols-[1fr_180px]">
                        <div className="space-y-1">
                          <Label htmlFor={`new-video-key-${section.id}`}>
                            Video key
                          </Label>
                          <Input
                            id={`new-video-key-${section.id}`}
                            placeholder="lessons/<course-id>/<file>.mp4"
                            value={newLessonVideoKey}
                            onChange={(event) =>
                              setNewLessonVideoKey(event.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`new-video-duration-${section.id}`}>
                            Duration (seconds)
                          </Label>
                          <Input
                            id={`new-video-duration-${section.id}`}
                            inputMode="numeric"
                            min={0}
                            step={1}
                            type="number"
                            value={newLessonDuration}
                            onChange={(event) =>
                              setNewLessonDuration(event.target.value)
                            }
                          />
                        </div>
                      </div>
                    ) : (
                      <TestQuestionBuilder
                        disabled={Boolean(busyAction)}
                        questionType={newLessonQuestionType}
                        questions={newLessonQuestions}
                        onQuestionTypeChange={(value) => {
                          setNewLessonQuestionType(value);
                          setNewLessonQuestions((current) =>
                            normalizeQuestionsForType(current, value)
                          );
                        }}
                        onAddQuestion={() =>
                          setNewLessonQuestions((current) => [
                            ...current,
                            createQuestionDraft(newLessonQuestionType),
                          ])
                        }
                        onRemoveQuestion={(questionId) =>
                          setNewLessonQuestions((current) =>
                            current.length <= 1
                              ? current
                              : current.filter(
                                  (question) => question.id !== questionId
                                )
                          )
                        }
                        onQuestionChange={(questionId, value) =>
                          setNewLessonQuestions((current) =>
                            updateQuestionText(current, questionId, value)
                          )
                        }
                        onAddAnswer={(questionId) =>
                          setNewLessonQuestions((current) =>
                            addAnswer(current, questionId)
                          )
                        }
                        onRemoveAnswer={(questionId, answerId) =>
                          setNewLessonQuestions((current) =>
                            removeAnswer(
                              current,
                              newLessonQuestionType,
                              questionId,
                              answerId
                            )
                          )
                        }
                        onAnswerChange={(questionId, answerId, value) =>
                          setNewLessonQuestions((current) =>
                            updateAnswerContent(
                              current,
                              questionId,
                              answerId,
                              value
                            )
                          )
                        }
                        onAnswerCorrectChange={(
                          questionId,
                          answerId,
                          checked
                        ) =>
                          setNewLessonQuestions((current) =>
                            updateAnswerCorrect(
                              current,
                              newLessonQuestionType,
                              questionId,
                              answerId,
                              checked
                            )
                          )
                        }
                      />
                    )}

                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        className="gap-1.5"
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
                        className="gap-1.5"
                        disabled={Boolean(busyAction)}
                        onClick={() => setAddingLessonSectionId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {!section.lessons.length && (
                  <div
                    className="
                      rounded-xl border border-dashed border-white/55
                      bg-nm-bg/70 p-4 text-sm text-slate-500
                    "
                  >
                    Section này chưa có lesson.
                  </div>
                )}

                <div className="space-y-2">
                  {section.lessons.map((lesson, lessonIndex) => {
                    const key = lessonKey(section.id, lesson, lessonIndex);
                    const isLessonBusy = busyAction?.includes(key) ?? false;
                    const meta =
                      localLessonMeta[lesson.id ?? ''] ?? localLessonMeta[key];

                    return (
                      <div
                        key={key}
                        className="
                          flex flex-wrap items-center justify-between gap-3
                          rounded-xl border border-white/50 bg-nm-bg/75 p-3
                          shadow-nm-inset
                        "
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="truncate font-medium">
                            {lesson.title}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>Lesson {lessonIndex + 1}</span>
                            {meta?.lessonType && (
                              <Badge variant="outline">
                                {meta.lessonType === 'video' ? 'Video' : 'Test'}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            disabled={lessonIndex === 0 || isLessonBusy}
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
                            size="icon-sm"
                            disabled={
                              lessonIndex === section.lessons.length - 1 ||
                              isLessonBusy
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
                            size="icon-sm"
                            disabled={isLessonBusy}
                            onClick={() =>
                              openLessonEditor(section.id, lesson, lessonIndex)
                            }
                          >
                            <FilePenLine className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon-sm"
                            disabled={isLessonBusy}
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
                </div>
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
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit lesson</DialogTitle>
            <DialogDescription>
              Cập nhật lesson theo đúng contract video/test.
            </DialogDescription>
          </DialogHeader>

          {lessonEditor && (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="edit-lesson-title">Lesson title</Label>
                  <Input
                    id="edit-lesson-title"
                    value={lessonEditor.title}
                    onChange={(event) =>
                      setLessonEditor((current) =>
                        current
                          ? { ...current, title: event.target.value }
                          : current
                      )
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Lesson type</Label>
                  <Input disabled value={lessonEditor.lessonType} />
                </div>
              </div>

              {lessonEditor.lessonType === 'video' ? (
                <div className="grid gap-3 md:grid-cols-[1fr_180px]">
                  <div className="space-y-1">
                    <Label htmlFor="edit-video-key">Video key (optional)</Label>
                    <Input
                      id="edit-video-key"
                      placeholder="lessons/<course-id>/<file>.mp4"
                      value={lessonEditor.videoKey}
                      onChange={(event) =>
                        setLessonEditor((current) =>
                          current
                            ? { ...current, videoKey: event.target.value }
                            : current
                        )
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="edit-video-duration">
                      Duration (seconds)
                    </Label>
                    <Input
                      id="edit-video-duration"
                      inputMode="numeric"
                      min={0}
                      step={1}
                      type="number"
                      value={lessonEditor.duration}
                      onChange={(event) =>
                        setLessonEditor((current) =>
                          current
                            ? { ...current, duration: event.target.value }
                            : current
                        )
                      }
                    />
                  </div>
                </div>
              ) : (
                <TestQuestionBuilder
                  disabled={Boolean(busyAction)}
                  questionType={lessonEditor.questionType}
                  questions={lessonEditor.questions}
                  onQuestionTypeChange={(value) =>
                    setLessonEditor((current) =>
                      current && current.lessonType === 'test'
                        ? {
                            ...current,
                            questionType: value,
                            questions: normalizeQuestionsForType(
                              current.questions,
                              value
                            ),
                          }
                        : current
                    )
                  }
                  onAddQuestion={() =>
                    updateLessonEditorQuestions((current) => [
                      ...current,
                      createQuestionDraft(
                        lessonEditor.questionType ?? DEFAULT_QUESTION_TYPE
                      ),
                    ])
                  }
                  onRemoveQuestion={(questionId) =>
                    updateLessonEditorQuestions((current) =>
                      current.length <= 1
                        ? current
                        : current.filter(
                            (question) => question.id !== questionId
                          )
                    )
                  }
                  onQuestionChange={(questionId, value) =>
                    updateLessonEditorQuestions((current) =>
                      updateQuestionText(current, questionId, value)
                    )
                  }
                  onAddAnswer={(questionId) =>
                    updateLessonEditorQuestions((current) =>
                      addAnswer(current, questionId)
                    )
                  }
                  onRemoveAnswer={(questionId, answerId) =>
                    updateLessonEditorQuestions((current) =>
                      removeAnswer(
                        current,
                        lessonEditor.questionType,
                        questionId,
                        answerId
                      )
                    )
                  }
                  onAnswerChange={(questionId, answerId, value) =>
                    updateLessonEditorQuestions((current) =>
                      updateAnswerContent(current, questionId, answerId, value)
                    )
                  }
                  onAnswerCorrectChange={(questionId, answerId, checked) =>
                    updateLessonEditorQuestions((current) =>
                      updateAnswerCorrect(
                        current,
                        lessonEditor.questionType,
                        questionId,
                        answerId,
                        checked
                      )
                    )
                  }
                />
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
