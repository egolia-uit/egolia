package core

import "context"

type User struct {
	ID    string
	Name  string
	Email string
}

type IdentitySvc interface {
	GetUser(ctx context.Context, userID string) (*User, error)
	GetUsers(ctx context.Context, userIDs []string) ([]*User, error)
}
