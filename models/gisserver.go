package models

import (
	"crypto/tls"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/httplib"
)

const (
	GISADMINADDRESS = "https://gis.xzdbd.com/arcgis/admin/system/handlers/rest/cache/clear"
)

var (
	gisAdminToken = beego.AppConfig.String("gisAdminToken")
)

type ClearRestCacheResp struct {
	Status   string   `json:"status"`
	Code     int      `json:"code"`
	Messages []string `json:"messages"`
}

func ClearRestCache(folderName string, serviceName string, serviceType string) (clearRestCacheResp ClearRestCacheResp, err error) {
	url := GISADMINADDRESS
	req := httplib.Get(url)
	req.SetTLSClientConfig(&tls.Config{InsecureSkipVerify: true})
	req.Param("token", gisAdminToken)
	if folderName != "" {
		req.Param("folderName", folderName)
	}
	if serviceName != "" {
		req.Param("serviceName", serviceName)
	}
	if serviceType != "" {
		req.Param("type", serviceType)
	}
	req.Param("f", "json")
	err = req.ToJSON(&clearRestCacheResp)
	return
}
