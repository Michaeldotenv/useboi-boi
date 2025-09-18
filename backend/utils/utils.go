package utils

import (
	"encoding/json"
	"errors"
	"fmt"
	"math/rand"
	"reflect"
	"time"
)


func ValidateNotEmpty(s interface{}) error {
	val := reflect.ValueOf(s)
	typ := reflect.TypeOf(s)

	if val.Kind() != reflect.Struct {
		return errors.New("validateNotEmpty only accepts struct types")
	}

	for i := 0; i < val.NumField(); i++ {
		field := val.Field(i)
		fieldName := typ.Field(i).Name

		if field.Interface() == reflect.Zero(field.Type()).Interface() {
			return fmt.Errorf("field '%s' is empty", fieldName)
		}
	}

	return nil
}

func GenerateRandomString(charSet string, length int) string {
	b := make([]byte, length)
	for i := range b {
		b[i] = charSet[rand.Intn(len(charSet))]
	}
	return string(b)
}

func MapToStruct(m map[string]interface{}, result interface{}) error {
	jsonData, err := json.Marshal(m)
	if err != nil {
		return err
	}

	err = json.Unmarshal(jsonData, result)
	if err != nil {
		return err
	}

	return nil
}

func GeneratePaymentReference() string {
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
	const length = 10

	rand.Seed(time.Now().UnixNano())

	result := make([]byte, length)
	for i := range result {
		result[i] = charset[rand.Intn(len(charset))]
	}

	return string(result)
}

// func StructHasEmptyNonNullableFields(s interface{}) bool {
// 	v := reflect.ValueOf(s)

// 	if v.Kind() == reflect.Ptr {
// 		v = v.Elem()
// 	}
// 	if v.Kind() != reflect.Struct {
// 		return false
// 	}

// 	for i := 0; i < v.NumField(); i++ {
// 		value := v.Field(i)

// 		if value.Kind() == reflect.Ptr {
// 			continue
// 		}

// 		if reflect.DeepEqual(value.Interface(), reflect.Zero(value.Type()).Interface()) {
// 			return true
// 		}
// 	}

// 	return false
// }


func Average(numbers []int) float64 {
    if len(numbers) == 0 {
        return 0
    }

    sum := 0
    for _, num := range numbers {
        sum += num
    }

    return float64(sum) / float64(len(numbers))
}
