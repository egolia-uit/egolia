'use client';

import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  CirclePlay,
  FileQuestion,
  Loader2,
  Plus,
  Save,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { cn } from '#/components/lib/shadcn/utils';
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
import { uploadCourseVideo } from './course-shared';

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
  videoUrl: string;
  duration: string;
  questions: LessonQuestionDraft[];
};

type LocalLessonMeta = {
  lessonType: 'video' | 'test';
  questionType?: QuestionType;
  videoKey?: string;
  videoUrl?: string;
  duration?: string;
  questions?: LessonQuestionDraft[];
};

type UploadedVideo = {
  videoKey: string;
  uploadUrl?: string;
  expiresAt?: Date;
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

function getErrorMessage(caught: unknown, fallback: string) {
  return caught instanceof Error ? caught.message : fallback;
}

function toApiInt64(value: number) {
  return value as unknown as bigint;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }
  return `${(kb / 1024).toFixed(1)} MB`;
}

function readVideoDurationSeconds(video: HTMLVideoElement) {
  if (!Number.isFinite(video.duration) || video.duration < 0) {
    return null;
  }
  return String(Math.max(0, Math.round(video.duration)));
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
    <div className="
      space-y-4 rounded-2xl border border-slate-200/70 bg-nm-bg p-4
      shadow-nm-inset
    ">
      <div className="
        grid gap-2
        md:grid-cols-[220px_1fr] md:items-center
      ">
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
                border border-slate-200/70 bg-nm-bg py-3 shadow-nm-flat-sm
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
  const [newLessonVideoFile, setNewLessonVideoFile] = useState<File | null>(
    null
  );
  const [newLessonVideoPreviewUrl, setNewLessonVideoPreviewUrl] = useState<
    string | null
  >(null);
  const [newLessonUploading, setNewLessonUploading] = useState(false);
  const [newLessonUploadProgress, setNewLessonUploadProgress] = useState<
    number | null
  >(null);
  const [newLessonUploadError, setNewLessonUploadError] = useState<
    string | null
  >(null);
  const [newLessonUploadedVideo, setNewLessonUploadedVideo] =
    useState<UploadedVideo | null>(null);

  const [lessonEditor, setLessonEditor] = useState<LessonEditorState | null>(
    null
  );
  const [editLessonVideoFile, setEditLessonVideoFile] = useState<File | null>(
    null
  );
  const [editLessonVideoPreviewUrl, setEditLessonVideoPreviewUrl] = useState<
    string | null
  >(null);
  const [editLessonUploading, setEditLessonUploading] = useState(false);
  const [editLessonUploadProgress, setEditLessonUploadProgress] = useState<
    number | null
  >(null);
  const [editLessonUploadError, setEditLessonUploadError] = useState<
    string | null
  >(null);
  const [editLessonUploadedVideo, setEditLessonUploadedVideo] =
    useState<UploadedVideo | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null
  );
  const [selectedLessonKey, setSelectedLessonKey] = useState<string | null>(
    null
  );
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const [localLessonMeta, setLocalLessonMeta] = useState<
    Record<string, LocalLessonMeta>
  >({});
  const savedVideoPreviewUrlsRef = useRef<Set<string>>(new Set());

  function begin(actionKey: string) {
    setBusyAction(actionKey);
    setActionError(null);
    setActionMessage(null);
  }

  function end() {
    setBusyAction(null);
  }

  function createSavedVideoPreviewUrl(file: File | null) {
    if (!file) {
      return null;
    }

    const previewUrl = URL.createObjectURL(file);
    savedVideoPreviewUrlsRef.current.add(previewUrl);
    return previewUrl;
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

  useEffect(() => {
    if (!course.sections.length) {
      if (selectedSectionId !== null) {
        setSelectedSectionId(null);
      }
      if (selectedLessonKey !== null) {
        setSelectedLessonKey(null);
      }
      return;
    }

    if (
      !selectedSectionId ||
      !course.sections.some((section) => section.id === selectedSectionId)
    ) {
      setSelectedSectionId(course.sections[0].id);
      setSelectedLessonKey(null);
    }

    setExpandedSections((current) => {
      const next = { ...current };
      let changed = false;

      for (const section of course.sections) {
        if (!(section.id in next)) {
          next[section.id] = true;
          changed = true;
        }
      }

      for (const sectionId of Object.keys(next)) {
        if (!course.sections.some((section) => section.id === sectionId)) {
          delete next[sectionId];
          changed = true;
        }
      }

      return changed ? next : current;
    });
  }, [course.sections, selectedLessonKey, selectedSectionId]);

  useEffect(() => {
    if (!selectedSectionId) {
      return;
    }
    const section = course.sections.find((item) => item.id === selectedSectionId);
    if (!section) {
      return;
    }
    if (renamingSectionId !== selectedSectionId) {
      setRenamingSectionId(selectedSectionId);
      setRenamingSectionTitle(section.title);
    }
  }, [course.sections, renamingSectionId, selectedSectionId]);

  useEffect(() => {
    if (!newLessonVideoFile) {
      setNewLessonVideoPreviewUrl(null);
      return;
    }

    const previewUrl = URL.createObjectURL(newLessonVideoFile);
    setNewLessonVideoPreviewUrl(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [newLessonVideoFile]);

  useEffect(() => {
    if (!editLessonVideoFile) {
      setEditLessonVideoPreviewUrl(null);
      return;
    }

    const previewUrl = URL.createObjectURL(editLessonVideoFile);
    setEditLessonVideoPreviewUrl(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [editLessonVideoFile]);

  useEffect(
    () => () => {
      for (const previewUrl of savedVideoPreviewUrlsRef.current) {
        URL.revokeObjectURL(previewUrl);
      }
      savedVideoPreviewUrlsRef.current.clear();
    },
    []
  );

  function selectSection(sectionId: string) {
    const section = course.sections.find((item) => item.id === sectionId);
    if (!section) {
      return;
    }
    setSelectedSectionId(sectionId);
    setSelectedLessonKey(null);
    setAddingLessonSectionId(null);
    setLessonEditor(null);
    setRenamingSectionId(sectionId);
    setRenamingSectionTitle(section.title);
  }

  function toggleSectionExpand(sectionId: string) {
    setExpandedSections((current) => ({
      ...current,
      [sectionId]: !current[sectionId],
    }));
  }

  function resetNewLessonVideoUploadState() {
    setNewLessonVideoFile(null);
    setNewLessonUploading(false);
    setNewLessonUploadProgress(null);
    setNewLessonUploadError(null);
    setNewLessonUploadedVideo(null);
  }

  function resetEditLessonVideoUploadState() {
    setEditLessonVideoFile(null);
    setEditLessonUploading(false);
    setEditLessonUploadProgress(null);
    setEditLessonUploadError(null);
    setEditLessonUploadedVideo(null);
  }

  function upsertLocalLessonMeta(
    key: string,
    lessonId: string | undefined,
    meta: LocalLessonMeta
  ) {
    setLocalLessonMeta((current) => ({
      ...current,
      [key]: meta,
      ...(lessonId ? { [lessonId]: meta } : {}),
    }));
  }

  function getLessonMeta(
    sectionId: string,
    lesson: CourseLesson,
    index: number
  ) {
    const key = lessonKey(sectionId, lesson, index);
    const cachedMeta =
      (lesson.id ? localLessonMeta[lesson.id] : undefined) ??
      localLessonMeta[key];

    if (cachedMeta) {
      return cachedMeta;
    }

    if (selectedLessonKey === key && lessonEditor) {
      return { lessonType: lessonEditor.lessonType } satisfies LocalLessonMeta;
    }

    return null;
  }

  function getLessonTypeLabel(meta: LocalLessonMeta | null) {
    if (meta?.lessonType === 'test') {
      return 'Test';
    }
    if (meta?.lessonType === 'video') {
      return 'Video';
    }
    return 'Lesson';
  }

  async function uploadVideoAsset(
    file: File,
    onProgress?: (progress: number) => void
  ) {
    const result = (await uploadCourseVideo(
      courseId,
      file,
      onProgress
    )) as UploadedVideo;
    if (!result.videoKey?.trim()) {
      throw new Error('Upload thành công nhưng chưa nhận được video key.');
    }
    return result;
  }

  async function handleUploadNewLessonVideo() {
    if (!newLessonVideoFile) {
      return null;
    }

    setNewLessonUploading(true);
    setNewLessonUploadProgress(0);
    setNewLessonUploadError(null);

    try {
      const result = await uploadVideoAsset(
        newLessonVideoFile,
        setNewLessonUploadProgress
      );
      setNewLessonVideoKey(result.videoKey);
      setNewLessonUploadedVideo(result);
      return result.videoKey;
    } catch (error) {
      setNewLessonUploadError(
        getErrorMessage(error, 'Không thể upload video lesson.')
      );
      return null;
    } finally {
      setNewLessonUploading(false);
    }
  }

  async function handleUploadEditLessonVideo() {
    if (!editLessonVideoFile) {
      return null;
    }

    setEditLessonUploading(true);
    setEditLessonUploadProgress(0);
    setEditLessonUploadError(null);

    try {
      const result = await uploadVideoAsset(
        editLessonVideoFile,
        setEditLessonUploadProgress
      );
      setEditLessonUploadedVideo(result);
      setLessonEditor((current) =>
        current && current.lessonType === 'video'
          ? { ...current, videoKey: result.videoKey }
          : current
      );
      return result.videoKey;
    } catch (error) {
      setEditLessonUploadError(
        getErrorMessage(error, 'Không thể upload video lesson.')
      );
      return null;
    } finally {
      setEditLessonUploading(false);
    }
  }

  function resetLessonForm() {
    setNewLessonTitle('');
    setNewLessonType('video');
    setNewLessonQuestionType(DEFAULT_QUESTION_TYPE);
    setNewLessonQuestions([createQuestionDraft(DEFAULT_QUESTION_TYPE)]);
    setNewLessonVideoKey('');
    setNewLessonDuration('0');
    resetNewLessonVideoUploadState();
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
        const sectionId = localId('section');
        setSections((sections) => [
          ...sections,
          { id: sectionId, title, lessons: [] },
        ]);
        setSelectedSectionId(sectionId);
        setSelectedLessonKey(null);
        setExpandedSections((current) => ({
          ...current,
          [sectionId]: true,
        }));
        setRenamingSectionId(sectionId);
        setRenamingSectionTitle(title);
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
      if (selectedSectionId === sectionId) {
        setSelectedSectionId(null);
        setSelectedLessonKey(null);
        setLessonEditor(null);
      }
      setExpandedSections((current) => {
        if (!(sectionId in current)) {
          return current;
        }
        const next = { ...current };
        delete next[sectionId];
        return next;
      });
      setActionMessage('Section đã được xóa.');
    } catch (error) {
      const problem = normalizeApiError(error);
      if (isUnimplemented(problem)) {
        setSections((sections) =>
          sections.filter((section) => section.id !== sectionId)
        );
        if (selectedSectionId === sectionId) {
          setSelectedSectionId(null);
          setSelectedLessonKey(null);
          setLessonEditor(null);
        }
        setExpandedSections((current) => {
          if (!(sectionId in current)) {
            return current;
          }
          const next = { ...current };
          delete next[sectionId];
          return next;
        });
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
        let videoKey = newLessonVideoKey.trim();

        if (newLessonUploading) {
          setActionError({
            title: 'Đang upload',
            message: 'Hãy đợi upload video hoàn tất trước khi lưu lesson.',
          });
          return;
        }

        if (!videoKey && newLessonVideoFile) {
          const uploadedVideoKey = await handleUploadNewLessonVideo();
          if (!uploadedVideoKey) {
            return;
          }
          videoKey = uploadedVideoKey.trim();
        }

        const durationNumber = Number.parseInt(newLessonDuration, 10);
        if (!videoKey) {
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
            videoKey,
            duration: toApiInt64(durationNumber),
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
            videoUrl: undefined,
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
    setSelectedSectionId(sectionId);
    setSelectedLessonKey(key);
    setAddingLessonSectionId(null);
    resetEditLessonVideoUploadState();
    begin(`open-lesson-editor-${key}`);

    try {
      const persistedMeta =
        localLessonMeta[lesson.id ?? ''] ?? localLessonMeta[key];
      if (persistedMeta) {
        upsertLocalLessonMeta(key, lesson.id, persistedMeta);
        setLessonEditor({
          key,
          sectionId,
          lessonId: lesson.id,
          title: lesson.title,
          lessonType: persistedMeta.lessonType,
          questionType: persistedMeta.questionType ?? DEFAULT_QUESTION_TYPE,
          videoKey: persistedMeta.videoKey ?? '',
          videoUrl: persistedMeta.videoUrl ?? '',
          duration: persistedMeta.duration ?? '0',
          questions: cloneQuestions(
            persistedMeta.questions ?? [
              createQuestionDraft(DEFAULT_QUESTION_TYPE),
            ]
          ),
        });
        return;
      }

      if (lesson.id && !isLocalId(lesson.id)) {
        const { data } = await getLessonDetail({
          client: apiClient,
          path: { courseId, sectionId, lessonId: lesson.id },
          throwOnError: true,
        });

        if (data.data.lessonType === 'video') {
          const meta: LocalLessonMeta = {
            lessonType: 'video',
            videoKey: '',
            videoUrl: data.data.videoUrl ?? '',
            duration: data.data.duration.toString(),
          };
          upsertLocalLessonMeta(key, lesson.id, meta);
          setLessonEditor({
            key,
            sectionId,
            lessonId: lesson.id,
            title: data.data.title,
            lessonType: 'video',
            questionType: DEFAULT_QUESTION_TYPE,
            videoKey: '',
            videoUrl: data.data.videoUrl ?? '',
            duration: data.data.duration.toString(),
            questions: [],
          });
        } else {
          const questionType = toQuestionType(data.data.questionType);
          const questions = parseQuestions(data.data.questions, questionType);
          const meta: LocalLessonMeta = {
            lessonType: 'test',
            questionType,
            videoKey: '',
            videoUrl: '',
            duration: '0',
            questions,
          };
          upsertLocalLessonMeta(key, lesson.id, meta);
          setLessonEditor({
            key,
            sectionId,
            lessonId: lesson.id,
            title: data.data.title,
            lessonType: 'test',
            questionType,
            videoKey: '',
            videoUrl: '',
            duration: '0',
            questions: cloneQuestions(questions),
          });
        }
      } else {
        upsertLocalLessonMeta(key, lesson.id, {
          lessonType: 'video',
          questionType: DEFAULT_QUESTION_TYPE,
          videoKey: '',
          videoUrl: '',
          duration: '0',
          questions: [createQuestionDraft(DEFAULT_QUESTION_TYPE)],
        });
        setLessonEditor({
          key,
          sectionId,
          lessonId: lesson.id,
          title: lesson.title,
          lessonType: 'video',
          questionType: DEFAULT_QUESTION_TYPE,
          videoKey: '',
          videoUrl: '',
          duration: '0',
          questions: [createQuestionDraft(DEFAULT_QUESTION_TYPE)],
        });
      }

    } catch (error) {
      setActionError(normalizeApiError(error));
      setSelectedLessonKey(null);
      setLessonEditor(null);
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

    const editorKey = lessonEditor.key;
    let savedVideoKey = lessonEditor.videoKey.trim();
    let savedVideoUrl = lessonEditor.videoUrl;
    let savedDuration = lessonEditor.duration;
    let uploadedReplacementDuringSave = false;
    const replacementVideoFile =
      lessonEditor.lessonType === 'video' ? editLessonVideoFile : null;

    begin(`save-lesson-${lessonEditor.key}`);
    try {
      if (lessonEditor.lessonId && !isLocalId(lessonEditor.lessonId)) {
        if (lessonEditor.lessonType === 'video') {
          if (editLessonUploading) {
            setActionError({
              title: 'Đang upload',
              message: 'Hãy đợi upload video hoàn tất trước khi lưu lesson.',
            });
            return;
          }

          if (!savedVideoKey && editLessonVideoFile) {
            const uploadedVideoKey = await handleUploadEditLessonVideo();
            if (!uploadedVideoKey) {
              return;
            }
            savedVideoKey = uploadedVideoKey.trim();
            uploadedReplacementDuringSave = true;
          }

          const durationNumber = Number.parseInt(lessonEditor.duration, 10);
          if (!Number.isInteger(durationNumber) || durationNumber < 0) {
            setActionError({
              title: 'Sai dữ liệu',
              message: 'Duration phải là số nguyên không âm.',
            });
            return;
          }
          savedDuration = String(durationNumber);

          await editVideoLesson({
            body: {
              title,
              duration: toApiInt64(durationNumber),
              ...(savedVideoKey ? { videoKey: savedVideoKey } : {}),
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

        updateLessonTitle(lessonEditor.sectionId, lessonEditor.key, title);
        reload();
      } else {
        updateLessonTitle(lessonEditor.sectionId, lessonEditor.key, title);
      }

      const shouldUseReplacementPreview =
        lessonEditor.lessonType === 'video' &&
        replacementVideoFile &&
        savedVideoKey &&
        (uploadedReplacementDuringSave ||
          editLessonUploadedVideo?.videoKey === savedVideoKey);

      if (shouldUseReplacementPreview) {
        savedVideoUrl =
          createSavedVideoPreviewUrl(replacementVideoFile) ?? savedVideoUrl;
      }

      setLessonEditor((current) => {
        if (!current || current.key !== editorKey) {
          return current;
        }

        if (current.lessonType === 'video') {
          return {
            ...current,
            title,
            videoKey: savedVideoKey,
            videoUrl: savedVideoUrl,
            duration: savedDuration,
          };
        }

        return {
          ...current,
          title,
          questionType: lessonEditor.questionType,
          questions: cloneQuestions(lessonEditor.questions),
        };
      });

      upsertLocalLessonMeta(lessonEditor.key, lessonEditor.lessonId, {
        lessonType: lessonEditor.lessonType,
        questionType:
          lessonEditor.lessonType === 'test'
            ? lessonEditor.questionType
            : undefined,
        videoKey:
          lessonEditor.lessonType === 'video' ? savedVideoKey : undefined,
        videoUrl:
          lessonEditor.lessonType === 'video' ? savedVideoUrl : undefined,
        duration:
          lessonEditor.lessonType === 'video' ? savedDuration : undefined,
        questions:
          lessonEditor.lessonType === 'test'
            ? cloneQuestions(lessonEditor.questions)
            : undefined,
      });

      if (lessonEditor.lessonType === 'video' && replacementVideoFile) {
        resetEditLessonVideoUploadState();
      }
      setActionMessage('Lesson đã được cập nhật.');
    } catch (error) {
      const problem = normalizeApiError(error);
      if (isUnimplemented(problem)) {
        updateLessonTitle(lessonEditor.sectionId, lessonEditor.key, title);
        if (
          lessonEditor.lessonType === 'video' &&
          replacementVideoFile &&
          savedVideoKey
        ) {
          savedVideoUrl =
            createSavedVideoPreviewUrl(replacementVideoFile) ?? savedVideoUrl;
        }
        setLessonEditor((current) => {
          if (!current || current.key !== editorKey) {
            return current;
          }

          if (current.lessonType === 'video') {
            return {
              ...current,
              title,
              videoKey: savedVideoKey,
              videoUrl: savedVideoUrl,
              duration: savedDuration,
            };
          }

          return {
            ...current,
            title,
            questionType: lessonEditor.questionType,
            questions: cloneQuestions(lessonEditor.questions),
          };
        });
        upsertLocalLessonMeta(lessonEditor.key, lessonEditor.lessonId, {
          lessonType: lessonEditor.lessonType,
          questionType:
            lessonEditor.lessonType === 'test'
              ? lessonEditor.questionType
              : undefined,
          videoKey:
            lessonEditor.lessonType === 'video' ? savedVideoKey : undefined,
          videoUrl:
            lessonEditor.lessonType === 'video' ? savedVideoUrl : undefined,
          duration:
            lessonEditor.lessonType === 'video' ? savedDuration : undefined,
          questions:
            lessonEditor.lessonType === 'test'
              ? cloneQuestions(lessonEditor.questions)
              : undefined,
        });
        if (lessonEditor.lessonType === 'video' && replacementVideoFile) {
          resetEditLessonVideoUploadState();
        }
        setActionMessage(
          'Update lesson chưa có ở backend, đã mock dữ liệu trên FE.'
        );
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
      if (selectedLessonKey === key) {
        setSelectedLessonKey(null);
        setLessonEditor(null);
        resetEditLessonVideoUploadState();
      }
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
        if (selectedLessonKey === key) {
          setSelectedLessonKey(null);
          setLessonEditor(null);
          resetEditLessonVideoUploadState();
        }
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

  const totalLessons = course.sections.reduce(
    (count, section) => count + section.lessons.length,
    0
  );

  const selectedSection =
    selectedSectionId
      ? course.sections.find((section) => section.id === selectedSectionId) ??
        null
      : null;
  const selectedSectionIndex = selectedSection
    ? course.sections.findIndex((section) => section.id === selectedSection.id)
    : -1;
  const selectedLesson =
    selectedSection && selectedLessonKey
      ? selectedSection.lessons
          .map((lesson, index) => ({
            lesson,
            index,
            key: lessonKey(selectedSection.id, lesson, index),
          }))
          .find((item) => item.key === selectedLessonKey) ?? null
      : null;

  return (
    <div className="space-y-5">
      {actionMessage && (
        <InlineNotice title="Success" description={actionMessage} />
      )}
      {actionError && <ErrorState error={actionError} />}

      <div
        className="
          grid gap-5
          xl:grid-cols-[300px_minmax(0,1fr)]
        "
      >
        <Card
          className="
            h-fit border-none bg-nm-bg/95 shadow-nm-flat-sm
            xl:sticky xl:top-24
          "
        >
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="text-base text-slate-900">
              Course structure
            </CardTitle>
            <CardDescription>
              {course.sections.length} sections · {totalLessons} lessons
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-3 pb-3">
            <div className="
              grid gap-2
              sm:grid-cols-[1fr_auto]
            ">
              <Input
                className="h-9"
                placeholder="New section title..."
                value={createSectionTitle}
                onChange={(event) => setCreateSectionTitle(event.target.value)}
              />
              <Button
                type="button"
                size="sm"
                className="
                  gap-1.5 bg-primary text-primary-foreground
                  hover:opacity-95
                "
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
            </div>

            {!course.sections.length && (
              <p className="px-2 py-1 text-sm text-slate-500">
                Chưa có section nào.
              </p>
            )}

            <div className="space-y-1">
              {course.sections.map((section, sectionIndex) => {
                const isExpanded = expandedSections[section.id] !== false;
                const isSectionSelected =
                  selectedSectionId === section.id && !selectedLessonKey;
                const isSectionBusy =
                  busyAction?.includes(section.id ?? '') ?? false;

                return (
                  <div key={section.id} className="group/section rounded-xl">
                    <div
                      className={cn(
                        `
                          grid grid-cols-[auto_minmax(0,1fr)_auto] items-center
                          gap-1 rounded-xl px-1 py-1 transition-colors
                        `,
                        isSectionSelected
                          ? 'bg-primary/10 ring-1 ring-primary/25'
                          : 'hover:bg-white/45'
                      )}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className="
                          text-slate-500
                          hover:bg-white/60
                        "
                        onClick={() => toggleSectionExpand(section.id)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="size-3.5" />
                        ) : (
                          <ChevronRight className="size-3.5" />
                        )}
                      </Button>

                      <button
                        type="button"
                        className="
                          grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto]
                          items-center gap-2 rounded-lg px-1.5 py-1 text-left
                        "
                        onClick={() => selectSection(section.id)}
                      >
                        <span className="
                          w-5 text-right text-xs font-semibold text-primary
                        ">
                          {sectionIndex + 1}.
                        </span>
                        <span className="
                          truncate text-sm font-medium text-slate-900
                        ">
                          {section.title}
                        </span>
                        <span className="shrink-0 text-[11px] text-slate-500">
                          {section.lessons.length} lesson
                          {section.lessons.length === 1 ? '' : 's'}
                        </span>
                      </button>

                      <div
                        className="
                          inline-flex items-center gap-0.5 opacity-100
                          transition-opacity
                          sm:opacity-0
                          sm:group-hover/section:opacity-100
                          sm:focus-within:opacity-100
                        "
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          className="
                            text-slate-400
                            hover:bg-white/60 hover:text-slate-700
                          "
                          disabled={sectionIndex === 0 || isSectionBusy}
                          onClick={() =>
                            handleMoveSection(section.id, sectionIndex - 1)
                          }
                        >
                          <ArrowUp className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          className="
                            text-slate-400
                            hover:bg-white/60 hover:text-slate-700
                          "
                          disabled={
                            sectionIndex === course.sections.length - 1 ||
                            isSectionBusy
                          }
                          onClick={() =>
                            handleMoveSection(section.id, sectionIndex + 1)
                          }
                        >
                          <ArrowDown className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          className="
                            text-slate-400
                            hover:bg-red-50 hover:text-destructive
                          "
                          disabled={isSectionBusy}
                          onClick={() => handleDeleteSection(section.id)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="
                        mt-1 ml-8 space-y-0.5 border-l border-slate-300/70 pl-2
                      ">
                        {section.lessons.length === 0 && (
                          <p className="px-2 py-1 text-xs text-slate-500">
                            Empty section. Add lesson in editor panel.
                          </p>
                        )}
                        {section.lessons.map((lesson, lessonIndex) => {
                          const key = lessonKey(section.id, lesson, lessonIndex);
                          const meta = getLessonMeta(
                            section.id,
                            lesson,
                            lessonIndex
                          );
                          const lessonTypeLabel = getLessonTypeLabel(meta);
                          const isSelectedLesson = selectedLessonKey === key;

                          return (
                            <button
                              key={key}
                              type="button"
                              className={cn(
                                `
                                  grid w-full
                                  grid-cols-[auto_auto_minmax(0,1fr)]
                                  items-center gap-1.5 rounded-lg px-2 py-1.5
                                  text-left text-xs transition-colors
                                `,
                                isSelectedLesson
                                  ? `
                                    bg-primary/10 text-slate-900 ring-1
                                    ring-primary/25
                                  `
                                  : 'hover:bg-white/45'
                              )}
                              onClick={() =>
                                openLessonEditor(section.id, lesson, lessonIndex)
                              }
                            >
                              <span className="font-medium text-slate-500">
                                {lessonTypeLabel}
                              </span>
                              <span className="text-slate-400">•</span>
                              <span className="min-w-0 truncate text-slate-800">
                                {lesson.title}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {!selectedSection && (
            <Card className="
              border border-slate-200/70 bg-nm-bg/95 shadow-nm-flat-sm
            ">
              <CardContent className="py-8 text-sm text-slate-500">
                Chọn section hoặc lesson để chỉnh sửa.
              </CardContent>
            </Card>
          )}

          {selectedSection && !selectedLessonKey && (
            <Card className="border-none bg-nm-bg/95 shadow-nm-flat-sm">
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle className="text-lg text-slate-900">
                  Editing section
                </CardTitle>
                <CardDescription>
                  Section {selectedSectionIndex + 1} ·{' '}
                  {selectedSection.lessons.length} lessons
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-5 pt-0 pb-5">
                <div className="
                  grid gap-3
                  md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-end
                ">
                  <Input
                    className="h-10"
                    value={renamingSectionTitle}
                    onChange={(event) =>
                      setRenamingSectionTitle(event.target.value)
                    }
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="
                      gap-1.5 bg-primary text-primary-foreground
                      hover:opacity-95
                    "
                    disabled={Boolean(busyAction)}
                    onClick={() => handleRenameSection(selectedSection.id)}
                  >
                    <Save className="size-4" />
                    Save changes
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="
                      gap-1.5 text-slate-500
                      hover:bg-red-50 hover:text-destructive
                    "
                    disabled={Boolean(busyAction)}
                    onClick={() => handleDeleteSection(selectedSection.id)}
                  >
                    <Trash2 className="size-4" />
                    Delete section
                  </Button>
                </div>

                <div className="
                  space-y-2 rounded-2xl bg-white/35 p-2 ring-1 ring-slate-200/70
                ">
                  <div className="
                    flex items-center justify-between gap-2 px-2 py-1
                  ">
                    <p className="text-sm font-medium text-slate-800">
                      Lessons in this section
                    </p>
                    <Button
                      type="button"
                      variant={
                        addingLessonSectionId === selectedSection.id
                          ? 'inset'
                          : 'ghost'
                      }
                      size="sm"
                      className="
                        gap-1.5
                        hover:bg-white/70
                      "
                      disabled={newLessonUploading || Boolean(busyAction)}
                      onClick={() => {
                        setAddingLessonSectionId(
                          addingLessonSectionId === selectedSection.id
                            ? null
                            : selectedSection.id
                        );
                        setSelectedLessonKey(null);
                        setLessonEditor(null);
                        resetLessonForm();
                      }}
                    >
                      <Plus className="size-4" />
                      Add lesson
                    </Button>
                  </div>

                  <div className="
                    divide-y divide-slate-200/80 overflow-hidden rounded-xl
                  ">
                    {selectedSection.lessons.map((lesson, lessonIndex) => {
                      const key = lessonKey(
                        selectedSection.id,
                        lesson,
                        lessonIndex
                      );
                      const isLessonBusy = busyAction?.includes(key) ?? false;
                      const meta = getLessonMeta(
                        selectedSection.id,
                        lesson,
                        lessonIndex
                      );
                      const lessonTypeLabel = getLessonTypeLabel(meta);

                      return (
                        <div
                          key={key}
                          className="
                            group/lesson grid gap-3 bg-white/25 px-3 py-2
                            transition-colors
                            hover:bg-white/50
                            md:grid-cols-[minmax(0,1fr)_auto] md:items-center
                          "
                        >
                          <button
                            type="button"
                            className="min-w-0 text-left"
                            onClick={() =>
                              openLessonEditor(
                                selectedSection.id,
                                lesson,
                                lessonIndex
                              )
                            }
                          >
                            <div className="
                              grid min-w-0 grid-cols-[minmax(0,1fr)_auto]
                              items-center gap-2
                            ">
                              <p className="
                                truncate text-sm font-medium text-slate-900
                              ">
                                {lesson.title}
                              </p>
                              <Badge
                                variant="secondary"
                                className="
                                  inline-flex shrink-0 items-center gap-1 px-2
                                  py-0.5 text-[10px] shadow-none
                                "
                              >
                                {meta?.lessonType === 'test' ? (
                                  <FileQuestion className="size-3" />
                                ) : meta?.lessonType === 'video' ? (
                                  <CirclePlay className="size-3" />
                                ) : null}
                                {lessonTypeLabel}
                              </Badge>
                            </div>
                          </button>

                          <div
                            className="
                              inline-flex items-center gap-0.5 opacity-100
                              transition-opacity
                              sm:opacity-0
                              sm:group-hover/lesson:opacity-100
                              sm:focus-within:opacity-100
                            "
                          >
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              className="
                                text-slate-400
                                hover:bg-white/70 hover:text-slate-700
                              "
                              disabled={lessonIndex === 0 || isLessonBusy}
                              onClick={() =>
                                handleMoveLesson(
                                  selectedSection.id,
                                  lesson.id,
                                  key,
                                  lessonIndex,
                                  lessonIndex - 1
                                )}
                            >
                              <ArrowUp className="size-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              className="
                                text-slate-400
                                hover:bg-white/70 hover:text-slate-700
                              "
                              disabled={
                                lessonIndex === selectedSection.lessons.length - 1 ||
                                isLessonBusy
                              }
                              onClick={() =>
                                handleMoveLesson(
                                  selectedSection.id,
                                  lesson.id,
                                  key,
                                  lessonIndex,
                                  lessonIndex + 1
                                )
                              }
                            >
                              <ArrowDown className="size-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              className="
                                text-slate-400
                                hover:bg-red-50 hover:text-destructive
                              "
                              disabled={isLessonBusy}
                              onClick={() =>
                                handleDeleteLesson(selectedSection.id, lesson.id, key)
                              }
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                    {!selectedSection.lessons.length && (
                      <p className="px-3 py-2 text-xs text-slate-500">
                        Chưa có lesson trong section này.
                      </p>
                    )}
                  </div>
                </div>

                {addingLessonSectionId === selectedSection.id && (
                  <div className="
                    space-y-4 rounded-2xl bg-white/35 p-4 ring-1
                    ring-slate-200/70
                  ">
                    <div className="
                      grid gap-3
                      md:grid-cols-2
                    ">
                      <div className="space-y-1">
                        <Label htmlFor="new-lesson-title-builder">
                          Lesson title
                        </Label>
                        <Input
                          id="new-lesson-title-builder"
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
                          <SelectTrigger className="
                            h-10 w-full rounded-xl border-none bg-nm-bg px-4
                            shadow-nm-inset
                            focus-visible:ring-2 focus-visible:ring-ring
                          ">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="
                            border-none bg-nm-bg shadow-nm-flat
                          ">
                            <SelectItem value="video">Video lesson</SelectItem>
                            <SelectItem value="test">Test lesson</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {newLessonType === 'video' ? (
                      <div className="space-y-4">
                        <div className="
                          space-y-2 rounded-xl border border-slate-200/70
                          bg-nm-bg p-3 shadow-nm-inset
                        ">
                          <Label htmlFor="new-video-file-builder">
                            Upload lesson video
                          </Label>
                          <div className="
                            grid gap-2
                            md:grid-cols-[1fr_auto]
                          ">
                            <Input
                              id="new-video-file-builder"
                              accept="video/*"
                              type="file"
                              onChange={(event) => {
                                const file = event.target.files?.[0] ?? null;
                                setNewLessonVideoFile(file);
                                if (file) {
                                  setNewLessonVideoKey('');
                                }
                                setNewLessonUploadedVideo(null);
                                setNewLessonUploadProgress(null);
                                setNewLessonUploadError(null);
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className="gap-1.5"
                              disabled={
                                !newLessonVideoFile ||
                                newLessonUploading ||
                                Boolean(busyAction)
                              }
                              onClick={handleUploadNewLessonVideo}
                            >
                              {newLessonUploading ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <UploadCloud className="size-4" />
                              )}
                              {newLessonUploading ? 'Uploading...' : 'Upload'}
                            </Button>
                          </div>
                          {newLessonVideoFile && newLessonVideoPreviewUrl && (
                            <div
                              className="
                                grid gap-3 rounded-xl border border-slate-200/70
                                bg-nm-bg p-3 shadow-nm-flat-sm
                                md:grid-cols-[180px_minmax(0,1fr)]
                              "
                            >
                              <video
                                className="
                                  w-full rounded-lg bg-slate-950
                                  shadow-nm-flat-sm
                                "
                                controls
                                onLoadedMetadata={(event) => {
                                  const duration = readVideoDurationSeconds(
                                    event.currentTarget
                                  );
                                  if (duration) {
                                    setNewLessonDuration(duration);
                                  }
                                }}
                                preload="metadata"
                                src={newLessonVideoPreviewUrl}
                              />
                              <div className="
                                min-w-0 space-y-1 text-xs text-slate-600
                              ">
                                <p className="font-medium text-slate-900">
                                  {newLessonVideoFile.name}
                                </p>
                                <p>{formatFileSize(newLessonVideoFile.size)}</p>
                                <p>
                                  Metadata sẽ tự điền duration, upload sẽ điền{' '}
                                  <strong>video key</strong>.
                                </p>
                              </div>
                            </div>
                          )}
                          {newLessonUploadProgress !== null && (
                            <div className="mt-1 grid gap-1">
                              <div className="
                                h-2 overflow-hidden rounded-full bg-nm-bg
                                shadow-nm-inset
                              ">
                                <div
                                  className="
                                    h-full rounded-full bg-primary
                                    transition-all duration-300
                                  "
                                  style={{ width: `${newLessonUploadProgress}%` }}
                                />
                              </div>
                              <p className="text-right text-xs text-slate-500">
                                {newLessonUploadProgress}%
                              </p>
                            </div>
                          )}
                          {newLessonUploadedVideo && (
                            <p className="text-xs text-slate-600">
                              Uploaded key: {newLessonUploadedVideo.videoKey}
                            </p>
                          )}
                          {newLessonUploadError && (
                            <p className="text-xs text-destructive">
                              {newLessonUploadError}
                            </p>
                          )}
                        </div>

                        <div className="
                          grid gap-3
                          md:grid-cols-[1fr_180px]
                        ">
                          <div className="space-y-1">
                            <Label htmlFor="new-video-key-builder">
                              Video key
                            </Label>
                            <Input
                              id="new-video-key-builder"
                              value={newLessonVideoKey}
                              onChange={(event) =>
                                setNewLessonVideoKey(event.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="new-video-duration-builder">
                              Duration (seconds)
                            </Label>
                            <Input
                              id="new-video-duration-builder"
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
                        className="
                          gap-1.5 bg-primary text-primary-foreground
                          hover:opacity-95
                        "
                        disabled={Boolean(busyAction) || newLessonUploading}
                        onClick={() => handleCreateLesson(selectedSection.id)}
                      >
                        <Save className="size-4" />
                        Save lesson
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setAddingLessonSectionId(null);
                          resetLessonForm();
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {selectedLessonKey && (
            <Card className="
              border border-slate-200/70 bg-nm-bg/95 shadow-nm-flat-sm
            ">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-slate-900">
                  Editing lesson
                </CardTitle>
                <CardDescription>
                  {selectedLesson?.lesson.title ?? 'Loading lesson...'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-0">
                {lessonEditor ? (
                  <>
                    <div className="
                      grid gap-3
                      md:grid-cols-2
                    ">
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
                      <div className="
                        space-y-4 rounded-2xl border border-slate-200/70
                        bg-nm-bg p-4 shadow-nm-inset
                      ">
                        {lessonEditor.videoUrl ? (
                          <div className="space-y-2">
                            <Label>Current video</Label>
                            <video
                              key={lessonEditor.videoUrl}
                              className="
                                aspect-video w-full rounded-xl bg-slate-950
                                shadow-nm-flat-sm
                              "
                              controls
                              onLoadedMetadata={(event) => {
                                const duration = readVideoDurationSeconds(
                                  event.currentTarget
                                );
                                if (duration) {
                                  setLessonEditor((current) =>
                                    current && current.lessonType === 'video'
                                      ? { ...current, duration }
                                      : current
                                  );
                                }
                              }}
                              preload="metadata"
                              src={lessonEditor.videoUrl}
                            />
                          </div>
                        ) : (
                          <div
                            className="
                              rounded-xl bg-white/35 px-3 py-2 text-sm
                              text-slate-500 ring-1 ring-slate-200/70
                            "
                          >
                            Chưa lấy được video preview hiện tại từ API. Chọn
                            file mới bên dưới để xem trước trước khi upload.
                          </div>
                        )}

                        <div className="
                          grid gap-3
                          md:grid-cols-[1fr_180px]
                        ">
                          <div className="space-y-1">
                            <Label htmlFor="edit-video-key">
                              Video key (optional)
                            </Label>
                            <Input
                              id="edit-video-key"
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

                        <div className="
                          space-y-2 rounded-xl border border-slate-200/70
                          bg-nm-bg p-3 shadow-nm-inset
                        ">
                          <Label htmlFor="edit-video-file">
                            Upload replacement video
                          </Label>
                          <div className="
                            grid gap-2
                            md:grid-cols-[1fr_auto]
                          ">
                            <Input
                              id="edit-video-file"
                              accept="video/*"
                              type="file"
                              onChange={(event) => {
                                const file = event.target.files?.[0] ?? null;
                                setEditLessonVideoFile(file);
                                if (file) {
                                  setLessonEditor((current) =>
                                    current && current.lessonType === 'video'
                                      ? { ...current, videoKey: '' }
                                      : current
                                  );
                                }
                                setEditLessonUploadedVideo(null);
                                setEditLessonUploadProgress(null);
                                setEditLessonUploadError(null);
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className="gap-1.5"
                              disabled={
                                !editLessonVideoFile ||
                                editLessonUploading ||
                                Boolean(busyAction)
                              }
                              onClick={handleUploadEditLessonVideo}
                            >
                              {editLessonUploading ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <UploadCloud className="size-4" />
                              )}
                              {editLessonUploading ? 'Uploading...' : 'Upload'}
                            </Button>
                          </div>
                          {editLessonVideoFile && editLessonVideoPreviewUrl && (
                            <div
                              className="
                                grid gap-3 rounded-xl border border-slate-200/70
                                bg-nm-bg p-3 shadow-nm-flat-sm
                                md:grid-cols-[180px_minmax(0,1fr)]
                              "
                            >
                              <video
                                className="
                                  w-full rounded-lg bg-slate-950
                                  shadow-nm-flat-sm
                                "
                                controls
                                onLoadedMetadata={(event) => {
                                  const duration = readVideoDurationSeconds(
                                    event.currentTarget
                                  );
                                  if (duration) {
                                    setLessonEditor((current) =>
                                      current && current.lessonType === 'video'
                                        ? { ...current, duration }
                                        : current
                                    );
                                  }
                                }}
                                preload="metadata"
                                src={editLessonVideoPreviewUrl}
                              />
                              <div className="
                                min-w-0 space-y-1 text-xs text-slate-600
                              ">
                                <p className="font-medium text-slate-900">
                                  {editLessonVideoFile.name}
                                </p>
                                <p>{formatFileSize(editLessonVideoFile.size)}</p>
                                <p>
                                  Metadata sẽ tự cập nhật duration, upload sẽ đổi{' '}
                                  <strong>video key</strong>.
                                </p>
                              </div>
                            </div>
                          )}
                          {editLessonUploadProgress !== null && (
                            <div className="mt-1 grid gap-1">
                              <div className="
                                h-2 overflow-hidden rounded-full bg-nm-bg
                                shadow-nm-inset
                              ">
                                <div
                                  className="
                                    h-full rounded-full bg-primary
                                    transition-all duration-300
                                  "
                                  style={{ width: `${editLessonUploadProgress}%` }}
                                />
                              </div>
                              <p className="text-right text-xs text-slate-500">
                                {editLessonUploadProgress}%
                              </p>
                            </div>
                          )}
                          {editLessonUploadedVideo && (
                            <p className="text-xs text-slate-600">
                              Uploaded key: {editLessonUploadedVideo.videoKey}
                            </p>
                          )}
                          {editLessonUploadError && (
                            <p className="text-xs text-destructive">
                              {editLessonUploadError}
                            </p>
                          )}
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
                            updateAnswerContent(
                              current,
                              questionId,
                              answerId,
                              value
                            )
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
                        variant="ghost"
                        className="
                          mr-auto text-slate-500
                          hover:bg-red-50 hover:text-destructive
                        "
                        disabled={Boolean(busyAction) || editLessonUploading}
                        onClick={() =>
                          handleDeleteLesson(
                            lessonEditor.sectionId,
                            lessonEditor.lessonId,
                            lessonEditor.key
                          )
                        }
                      >
                        <Trash2 className="size-4" />
                        Delete lesson
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={Boolean(busyAction) || editLessonUploading}
                        onClick={() => {
                          setSelectedLessonKey(null);
                          setLessonEditor(null);
                          resetEditLessonVideoUploadState();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        className="
                          bg-primary text-primary-foreground
                          hover:opacity-95
                        "
                        disabled={Boolean(busyAction) || editLessonUploading}
                        onClick={handleSaveLessonEdit}
                      >
                        <Save className="size-4" />
                        Save lesson
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="
                    flex items-center gap-2 text-sm text-slate-500
                  ">
                    <Loader2 className="size-4 animate-spin" />
                    Loading lesson editor...
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <details className="
            rounded-2xl bg-nm-bg/90 px-4 py-3 text-xs text-slate-600
            shadow-nm-flat-sm
          ">
            <summary className="
              cursor-pointer text-sm font-medium text-slate-800
            ">
              Notes & Storage
            </summary>
            <div className="mt-2 space-y-1.5">
              <p>
                Upload video để lấy <strong>video key</strong>, duration sẽ tự
                lấy từ metadata khi browser đọc được file.
              </p>
              <p>
                Editor bên phải chỉ focus vào item đang chọn để tránh scroll dài
                khi course có nhiều lesson.
              </p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
