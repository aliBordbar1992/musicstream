package services

import (
	"context"
	"encoding/json"
	"time"

	"github.com/aliBordbar1992/musicstream-backend/internal/domain"
	"github.com/redis/go-redis/v9"
)

type redisCacheService struct {
	client *redis.Client
	ctx    context.Context
}

// NewRedisCacheService creates a new instance of RedisCacheService
func NewRedisCacheService(client *redis.Client) domain.CacheService {
	return &redisCacheService{
		client: client,
		ctx:    context.Background(),
	}
}

func (s *redisCacheService) Set(key string, value interface{}, expiration time.Duration) error {
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}

	return s.client.Set(s.ctx, key, data, expiration).Err()
}

func (s *redisCacheService) Get(key string, dest interface{}) error {
	data, err := s.client.Get(s.ctx, key).Bytes()
	if err != nil {
		return err
	}

	return json.Unmarshal(data, dest)
}

func (s *redisCacheService) Delete(key string) error {
	return s.client.Del(s.ctx, key).Err()
}

func (s *redisCacheService) Exists(key string) (bool, error) {
	exists, err := s.client.Exists(s.ctx, key).Result()
	return exists > 0, err
}
