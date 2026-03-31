package course

type Server struct{}

func NewServer() *Server {
	return &Server{}
}

var ProvideServer = NewServer
