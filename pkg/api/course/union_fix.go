package course

func (t *CreateLessonJSONRequestBody) UnmarshalJSON(b []byte) error {
	return (*CreateLessonJSONBody)(t).UnmarshalJSON(b)
}

func (t CreateLessonJSONRequestBody) MarshalJSON() ([]byte, error) {
	return (CreateLessonJSONBody)(t).MarshalJSON()
}
