package app

import (
	"github.com/goforj/wire"
)

var ProviderSetCmds = wire.NewSet(
	NewCreatePostHandler,
	NewUpdatePostHandler,
	NewDeletePostHandler,
	NewCommentOnPostHandler,
	NewUpdateCommentHandler,
	NewDeleteCommentHandler,
	NewReplyCommentHandler,

	NewCmds,
)

var ProviderSetQueries = wire.NewSet(
	NewSearchPostsHandler,
	NewGetPostByIdHandler,
	NewGetPostCommentsHandler,

	NewQueries,
)

var ProviderSet = wire.NewSet(
	ProvideHandlerProvider,
	ProviderSetCmds,
	ProviderSetQueries,
	wire.Struct(new(App), "*"),
)
