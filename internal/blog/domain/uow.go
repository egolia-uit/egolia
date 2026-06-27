package domain

import "context"

type RepoRegistry interface {
	Post() PostRepo
	Comment() CommentRepo
}

type UnitOfWork interface {
	Execute(ctx context.Context, fn func(repoRegistry RepoRegistry) error) error
}
