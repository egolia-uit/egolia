package errs

import "fmt"

type Code string

func (c Code) String() string {
	return string(c)
}

const (
	CodeUnauthorized  Code = "unauthorized"
	CodeForbidden     Code = "forbidden"
	CodeInvalid       Code = "invalid"
	CodeUnimplemented Code = "unimplemented"
	CodeInternal      Code = "internal"
)

type Error interface {
	error
	Code() Code
	Message() string
	Unwrap() error
}

type Err struct {
	message string
	code    Code
	err     error
}

var _ Error = (*Err)(nil)

func (e Err) Error() string {
	if e.err != nil {
		return fmt.Sprintf("%s: %v", e.message, e.err)
	}
	return e.message
}
func (e Err) Unwrap() error   { return e.err }
func (e Err) Code() Code      { return e.code }
func (e Err) Message() string { return e.message }

var Unauthorized = &Err{
	message: "unauthorized",
	code:    CodeUnauthorized,
}

var Unimplemented = &Err{
	message: "unimplemented",
	code:    CodeUnimplemented,
}

type Forbidden struct {
	Err
}

func NewForbidden(message string) *Forbidden {
	return &Forbidden{
		Err: Err{
			message: message,
			code:    CodeForbidden,
		},
	}
}

type Invalid struct {
	Err
}

func NewInvalid(message string) *Invalid {
	return &Invalid{
		Err: Err{
			message: message,
			code:    CodeInvalid,
		},
	}
}

type Internal struct {
	Err
}

func NewInternalErr(message string, err error) *Internal {
	return &Internal{
		Err: Err{
			message: message,
			code:    CodeInternal,
			err:     err,
		},
	}
}
