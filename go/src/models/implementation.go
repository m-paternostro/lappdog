package models

type Implementation struct {
  Id string `json:"id,omitempty"`
  Name string `json:"name"`
  Image string `json:"image,omitempty"`
  Color string `json:"color,omitempty"`
}
