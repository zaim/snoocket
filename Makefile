PATH := ./node_modules/.bin:$(PATH)
NODE_ENV = testing
TEST_NAMESPACE = snoocket.test
TEST_PORT = 8888
TEST_MOCK_REQUESTS = true

test:
	mocha

server:
	node test/_server.js

.PHONY: test server
