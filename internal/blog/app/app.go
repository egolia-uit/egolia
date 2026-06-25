package app

import (
	"log/slog"

	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
	"go.opentelemetry.io/otel/trace"
)

type HandlerProvider commonhandler.HandlerProvider

func NewHandlerProvider(
	traceProvider trace.TracerProvider,
	logger *slog.Logger,
) *HandlerProvider {
	tracer := traceProvider.Tracer("blog-app")
	return (*HandlerProvider)(
		commonhandler.NewHandlerProvider(
			commonhandler.WithTracer(tracer),
			commonhandler.WithLogger(logger),
		),
	)
}

var ProvideHandlerProvider = NewHandlerProvider

type (
	CreatePostCmd    commonhandler.Cmd[CreatePost]
	UpdatePostCmd    commonhandler.Cmd[UpdatePost]
	DeletePostCmd    commonhandler.Cmd[DeletePost]
	CommentOnPostCmd commonhandler.Cmd[CommentOnPost]
	UpdateCommentCmd commonhandler.Cmd[UpdateComment]
	DeleteCommentCmd commonhandler.Cmd[DeleteComment]
	ReplyCommentCmd  commonhandler.Cmd[ReplyComment]
)

type (
	SearchPostsQuery     commonhandler.Query[SearchPosts, *Paginated[Post]]
	GetPostByIdQuery     commonhandler.Query[GetPostById, *Post]
	GetPostCommentsQuery commonhandler.Query[GetPostComments, []*Comment]
)

type Cmds struct {
	CreatePost    CreatePostCmd
	UpdatePost    UpdatePostCmd
	DeletePost    DeletePostCmd
	CommentOnPost CommentOnPostCmd
	UpdateComment UpdateCommentCmd
	DeleteComment DeleteCommentCmd
	ReplyComment  ReplyCommentCmd
}

type Queries struct {
	SearchPosts     SearchPostsQuery
	GetPostById     GetPostByIdQuery
	GetPostComments GetPostCommentsQuery
}

type App struct {
	Cmds    *Cmds
	Queries *Queries
}

func NewCmds(
	hp *HandlerProvider,
	createPost *CreatePostHandler,
	updatePost *UpdatePostHandler,
	deletePost *DeletePostHandler,
	commentOnPost *CommentOnPostHandler,
	updateComment *UpdateCommentHandler,
	deleteComment *DeleteCommentHandler,
	replyComment *ReplyCommentHandler,
) *Cmds {
	chp := (*commonhandler.HandlerProvider)(hp)
	return &Cmds{
		CreatePost:    commonhandler.DecorateCmd(chp, createPost),
		UpdatePost:    commonhandler.DecorateCmd(chp, updatePost),
		DeletePost:    commonhandler.DecorateCmd(chp, deletePost),
		CommentOnPost: commonhandler.DecorateCmd(chp, commentOnPost),
		UpdateComment: commonhandler.DecorateCmd(chp, updateComment),
		DeleteComment: commonhandler.DecorateCmd(chp, deleteComment),
		ReplyComment:  commonhandler.DecorateCmd(chp, replyComment),
	}
}

func NewQueries(
	hp *HandlerProvider,
	searchPosts *SearchPostsHandler,
	getPostById *GetPostByIdHandler,
	getPostComments *GetPostCommentsHandler,
) *Queries {
	chp := (*commonhandler.HandlerProvider)(hp)
	return &Queries{
		SearchPosts:     commonhandler.DecorateQuery(chp, searchPosts),
		GetPostById:     commonhandler.DecorateQuery(chp, getPostById),
		GetPostComments: commonhandler.DecorateQuery(chp, getPostComments),
	}
}

func NewApp(cmds *Cmds, queries *Queries) *App {
	return &App{
		Cmds:    cmds,
		Queries: queries,
	}
}
