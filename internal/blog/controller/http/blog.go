package http

import (
	"context"

	"github.com/egolia-uit/egolia/internal/blog/app"
	"github.com/egolia-uit/egolia/internal/blog/errs"
	"github.com/egolia-uit/egolia/pkg/api/blog"
	commonHTTP "github.com/egolia-uit/egolia/pkg/common/http"
	"github.com/google/uuid"
)

func (h *StrictHandler) DeleteComment(ctx context.Context, request blog.DeleteCommentRequestObject) (blog.DeleteCommentResponseObject, error) {
	user, ok := commonHTTP.UserFromContext(ctx)
	if !ok {
		return nil, errs.Unauthorized
	}
	roles := make([]string, 0, len(user.Roles))
	for _, r := range user.Roles {
		roles = append(roles, string(r))
	}

	if err := h.App.Cmds.DeleteComment.Handle(ctx, &app.DeleteComment{
		CommentID:  request.CommentId,
		ActorID:    user.ID,
		ActorRoles: roles,
	}); err != nil {
		return nil, err
	}
	return blog.DeleteComment204Response{}, nil
}

func (h *StrictHandler) UpdateComment(ctx context.Context, request blog.UpdateCommentRequestObject) (blog.UpdateCommentResponseObject, error) {
	user, ok := commonHTTP.UserFromContext(ctx)
	if !ok {
		return nil, errs.Unauthorized
	}
	roles := make([]string, 0, len(user.Roles))
	for _, r := range user.Roles {
		roles = append(roles, string(r))
	}

	if err := h.App.Cmds.UpdateComment.Handle(ctx, &app.UpdateComment{
		CommentID:  request.CommentId,
		ActorID:    user.ID,
		ActorRoles: roles,
		Content:    request.Body.Content,
	}); err != nil {
		return nil, err
	}
	//nolint:exhaustruct // Response fields can be empty
	return blog.UpdateComment200JSONResponse{}, nil
}

func (h *StrictHandler) ReplyComment(ctx context.Context, request blog.ReplyCommentRequestObject) (blog.ReplyCommentResponseObject, error) {
	user, ok := commonHTTP.UserFromContext(ctx)
	if !ok {
		return nil, errs.Unauthorized
	}

	commentID, err := uuid.NewV7()
	if err != nil {
		return nil, err
	}

	if err := h.App.Cmds.ReplyComment.Handle(ctx, &app.ReplyComment{
		CommentID:       commentID,
		ParentCommentID: request.CommentId,
		AuthorID:        user.ID,
		Content:         request.Body.Content,
	}); err != nil {
		return nil, err
	}
	//nolint:exhaustruct // Response fields can be empty
	return blog.ReplyComment201JSONResponse{
		Id:              &commentID,
		PostId:          request.Body.PostId,
		ParentCommentId: &request.CommentId,
		AuthorId:        &user.ID,
		Content:         request.Body.Content,
	}, nil
}

func (h *StrictHandler) SearchPosts(ctx context.Context, request blog.SearchPostsRequestObject) (blog.SearchPostsResponseObject, error) {
	page := 1
	if request.Params.Page != nil {
		page = *request.Params.Page
	}
	limit := 20
	if request.Params.Limit != nil {
		limit = *request.Params.Limit
	}
	var order *app.SearchPostsOrder
	if request.Params.Order != nil {
		val := app.SearchPostsOrder(*request.Params.Order)
		order = &val
	}

	result, err := h.App.Queries.SearchPosts.Handle(ctx, &app.SearchPosts{
		Query: request.Params.Q,
		Tag:   request.Params.Tag,
		Paginate: app.PaginationParams{
			Page:  page,
			Limit: limit,
		},
		Order: order,
	})
	if err != nil {
		return nil, err
	}

	posts := make([]blog.Post, 0, len(result.Data))
	for i := range result.Data {
		posts = append(posts, postToDTO(&result.Data[i]))
	}

	pagination := result.Pagination
	return blog.SearchPosts200JSONResponse{
		Data: posts,
		Pagination: blog.Pagination{
			Page:       pagination.Page,
			Limit:      pagination.Limit,
			Total:      pagination.Total,
			TotalPages: pagination.TotalPages,
			HasNext:    pagination.HasNext,
			HasPrev:    pagination.HasPrev,
		},
	}, nil
}

func (h *StrictHandler) CreatePost(ctx context.Context, request blog.CreatePostRequestObject) (blog.CreatePostResponseObject, error) {
	user, ok := commonHTTP.UserFromContext(ctx)
	if !ok {
		return nil, errs.Unauthorized
	}

	postID, err := uuid.NewV7()
	if err != nil {
		return nil, err
	}

	if err := h.App.Cmds.CreatePost.Handle(ctx, &app.CreatePost{
		ID:       postID,
		AuthorID: user.ID,
		Title:    request.Body.Title,
		Content:  request.Body.Content,
		Tags:     request.Body.Tags,
	}); err != nil {
		return nil, err
	}
	//nolint:exhaustruct // Response fields can be empty
	resp := blog.CreatePost201JSONResponse{
		Id:       &postID,
		AuthorId: &user.ID,
		Title:    request.Body.Title,
		Content:  request.Body.Content,
		Tags:     request.Body.Tags,
	}
	return resp, nil
}

func (h *StrictHandler) DeletePost(ctx context.Context, request blog.DeletePostRequestObject) (blog.DeletePostResponseObject, error) {
	user, ok := commonHTTP.UserFromContext(ctx)
	if !ok {
		return nil, errs.Unauthorized
	}
	roles := make([]string, 0, len(user.Roles))
	for _, r := range user.Roles {
		roles = append(roles, string(r))
	}

	if err := h.App.Cmds.DeletePost.Handle(ctx, &app.DeletePost{
		PostID:     request.PostId,
		ActorID:    user.ID,
		ActorRoles: roles,
	}); err != nil {
		return nil, err
	}
	return blog.DeletePost204Response{}, nil
}

func (h *StrictHandler) GetPostById(ctx context.Context, request blog.GetPostByIdRequestObject) (blog.GetPostByIdResponseObject, error) {
	result, err := h.App.Queries.GetPostById.Handle(ctx, &app.GetPostById{
		PostID: request.PostId,
	})
	if err != nil {
		return nil, err
	}
	post := postToDTO(result)
	return blog.GetPostById200JSONResponse(post), nil
}

func (h *StrictHandler) UpdatePost(ctx context.Context, request blog.UpdatePostRequestObject) (blog.UpdatePostResponseObject, error) {
	user, ok := commonHTTP.UserFromContext(ctx)
	if !ok {
		return nil, errs.Unauthorized
	}
	roles := make([]string, 0, len(user.Roles))
	for _, r := range user.Roles {
		roles = append(roles, string(r))
	}

	if err := h.App.Cmds.UpdatePost.Handle(ctx, &app.UpdatePost{
		PostID:     request.PostId,
		ActorID:    user.ID,
		ActorRoles: roles,
		Title:      request.Body.Title,
		Content:    request.Body.Content,
		Tags:       request.Body.Tags,
	}); err != nil {
		return nil, err
	}
	//nolint:exhaustruct // Response fields can be empty
	return blog.UpdatePost200JSONResponse{}, nil
}

func (h *StrictHandler) GetPostComments(ctx context.Context, request blog.GetPostCommentsRequestObject) (blog.GetPostCommentsResponseObject, error) {
	result, err := h.App.Queries.GetPostComments.Handle(ctx, &app.GetPostComments{
		PostID: request.PostId,
	})
	if err != nil {
		return nil, err
	}
	comments := make([]blog.Comment, 0, len(result))
	for i := range result {
		comments = append(comments, commentToDTO(result[i]))
	}
	return blog.GetPostComments200JSONResponse{
		Data: comments,
	}, nil
}

func (h *StrictHandler) CommentOnPost(ctx context.Context, request blog.CommentOnPostRequestObject) (blog.CommentOnPostResponseObject, error) {
	user, ok := commonHTTP.UserFromContext(ctx)
	if !ok {
		return nil, errs.Unauthorized
	}

	commentID, err := uuid.NewV7()
	if err != nil {
		return nil, err
	}

	if err := h.App.Cmds.CommentOnPost.Handle(ctx, &app.CommentOnPost{
		CommentID: commentID,
		PostID:    request.PostId,
		AuthorID:  user.ID,
		Content:   request.Body.Content,
	}); err != nil {
		return nil, err
	}
	//nolint:exhaustruct // Response fields can be empty
	return blog.CommentOnPost201JSONResponse{
		Id:       &commentID,
		PostId:   &request.PostId,
		AuthorId: &user.ID,
		Content:  request.Body.Content,
	}, nil
}
