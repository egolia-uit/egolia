package persistence

import (
	"github.com/egolia-uit/egolia/internal/blog/app"
	"github.com/egolia-uit/egolia/internal/blog/domain"
	"github.com/egolia-uit/egolia/internal/blog/infra/persistence/readmodel"
	"github.com/egolia-uit/egolia/internal/blog/infra/persistence/repo"
	"github.com/goforj/wire"
)

var ReadModelProviderSet = wire.NewSet(
	readmodel.NewPostReadRepo,
	readmodel.NewCommentReadRepo,

	wire.Bind(new(app.SearchPostsReadModel), new(*readmodel.PostReadRepo)),
	wire.Bind(new(app.GetPostByIdReadModel), new(*readmodel.PostReadRepo)),
	wire.Bind(new(app.GetPostCommentsReadModel), new(*readmodel.CommentReadRepo)),
)

var RepoProviderSet = wire.NewSet(
	repo.NewRegistry,
	repo.NewUnitOfWork,
	repo.NewPostRepo,
	repo.NewCommentRepo,

	wire.Bind(new(domain.UnitOfWork), new(*repo.UnitOfWork)),
	wire.Bind(new(domain.PostRepo), new(*repo.PostRepo)),
	wire.Bind(new(domain.CommentRepo), new(*repo.CommentRepo)),
)

var ProviderSet = wire.NewSet(
	NewDB,
	NewPG,
	ReadModelProviderSet,
	RepoProviderSet,
)
