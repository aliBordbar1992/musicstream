package controllers

import "fmt"

// Helper function to parse uint from string
func parseUint(s string) uint {
	var result uint
	_, err := fmt.Sscanf(s, "%d", &result)
	if err != nil {
		return 0
	}
	return result
}
