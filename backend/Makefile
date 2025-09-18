# Development commands
run:
	export APP_ENV=development && go run cmd/app/main.go

# Production build commands
build:
	go build -o main cmd/app/main.go

build-linux:
	GOOS=linux GOARCH=amd64 go build -o main-linux cmd/app/main.go

# Docker commands
docker-build:
	docker build -t boiboi-backend .

docker-run:
	docker run -p 8082:8082 --env-file skulpoint.env boiboi-backend

# Clean up
clean:
	rm -f main main-linux

# Dependencies
deps:
	go mod download
	go mod tidy

# Test
test:
	go test ./...

# Lint
lint:
	golangci-lint run

# Generate Swagger docs
swagger:
	swag init -g cmd/app/main.go -o cmd/app/docs