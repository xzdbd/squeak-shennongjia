package models

import (
	"time"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/httplib"

	"errors"

	"strings"

	_ "github.com/lib/pq"
)

const (
	APIADDRESS = "http://www.pm25.in/api/querys/"
)

var (
	pm25token       = beego.AppConfig.String("pm25token")
	MonitorAreas    map[int]string
	MonitorStations map[int]string
)

type Pollution struct {
	StationName      string  `json:"position_name"`
	StationCode      string  `json:"station_code"`
	Aqi              int32   `json:"aqi"`
	Area             string  `json:"area"`
	PrimaryPollutant string  `json:"primary_pollutant"`
	So2              float32 `json:"so2"`
	So224h           float32 `json:"so2_24h"`
	No2              float32 `json:"no2"`
	No224h           float32 `json:"no2_24h"`
	Pm10             float32 `json:"pm10"`
	Pm1024h          float32 `json:"pm10_24h"`
	Co               float32 `json:"co2"`
	Co24h            float32 `json:"co2_24h"`
	O3               float32 `json:"o3"`
	O324h            float32 `json:"o3_24h"`
	O38h             float32 `json:"o3_8h"`
	O38h24h          float32 `json:"o3_8h_24h"`
	Pm25             float32 `json:"pm2_5"`
	Pm2524h          float32 `json:"pm2_5_24h"`
	Quality          string  `json:"quality"`
	TimeStr          string  `json:"time_point"`
	Time             time.Time
}

type PollutionError struct {
	Error string `json:"error"`
}

type Stations struct {
	City     string `json:"city"`
	Stations []Station
}

type Station struct {
	StationName string `json:"station_name"`
	StationCode string `json:"station_code"`
}

func init() {
	//InitMonitorPollution()
	//InitDB()
}

func GetAQIDetailsByCity(city string) ([]Pollution, error) {
	var pollutions []Pollution
	var pollutionError PollutionError
	url := APIADDRESS + "aqi_details.json"
	req := httplib.Get(url)
	req.Param("token", pm25token)
	req.Param("city", city)
	err := req.ToJSON(&pollutions)
	if err != nil {
		beego.Error(err)
		err := req.ToJSON(&pollutionError)
		if err != nil {
			return pollutions, err
		}
		beego.Error("API Error:", pollutionError.Error)
		return pollutions, errors.New(pollutionError.Error)
	}
	for i := 0; i < len(pollutions); i++ {
		var err error
		timeStr := pollutions[i].TimeStr
		timeStr = strings.Replace(timeStr, "Z", "+08:00", 1)
		pollutions[i].Time, err = time.Parse("2006-01-02T15:04:05Z07:00", timeStr)
		if err != nil {
			return pollutions, err
		}
	}
	return pollutions, nil
}

func GetStationInfoByCity(city string) (Stations, error) {
	var stations Stations
	var pollutionError PollutionError
	url := APIADDRESS + "station_names.json"
	req := httplib.Get(url)
	req.Param("token", pm25token)
	req.Param("city", city)
	err := req.ToJSON(&stations)
	if err != nil {
		beego.Error(err)
		err := req.ToJSON(&pollutionError)
		if err != nil {
			return stations, err
		}
		beego.Error("API Error:", pollutionError.Error)
		return stations, errors.New(pollutionError.Error)
	}
	return stations, nil
}

func InitMonitorPollution() {
	MonitorAreas = make(map[int]string)
	MonitorAreas[1] = "杭州"

	MonitorStations = make(map[int]string)
	MonitorStations[1] = "滨江"
	MonitorStations[2] = "西溪"
	MonitorStations[3] = "千岛湖"
	MonitorStations[4] = "下沙"
	MonitorStations[5] = "卧龙桥"
	MonitorStations[6] = "浙江农大"
	MonitorStations[7] = "朝晖五区"
	MonitorStations[8] = "和睦小学"
	MonitorStations[9] = "临平镇"
	MonitorStations[10] = "城厢镇"
	MonitorStations[11] = "云栖"
}
