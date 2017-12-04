package test

import (
	"path/filepath"
	"runtime"
	"testing"

	"github.com/xzdbd/squeak/models"
	_ "github.com/xzdbd/squeak/routers"

	"github.com/astaxie/beego"
)

func init() {
	_, file, _, _ := runtime.Caller(1)
	apppath, _ := filepath.Abs(filepath.Dir(filepath.Join(file, ".."+string(filepath.Separator))))
	beego.TestBeegoInit(apppath)
}

// TestMain is a sample to run an endpoint test
/*func TestMain(t *testing.T) {
	r, _ := http.NewRequest("GET", "/", nil)
	w := httptest.NewRecorder()
	beego.BeeApp.Handlers.ServeHTTP(w, r)

	beego.Trace("testing", "TestMain", "Code[%d]\n%s", w.Code, w.Body.String())

	Convey("Subject: Test Station Endpoint\n", t, func() {
		Convey("Status Code Should Be 200", func() {
			So(w.Code, ShouldEqual, 200)
		})
		Convey("The Result Should Not Be Empty", func() {
			So(w.Body.Len(), ShouldBeGreaterThan, 0)
		})
	})
}*/

/*func TestInsertArea(t *testing.T) {
	models.InitTableArea()
}*/

/*func TestInsertStation(t *testing.T) {
	models.InitTableStation()
}*/

/*func TestInsertPollution(t *testing.T) {
	models.InsertPollution()
}*/

/*func TestUpdatePollutionTable(t *testing.T) {
	num, err := models.InsertNewPollutionData()
	beego.Trace(num, err)
}*/

/*func TestQueryAreaInfo(t *testing.T) {
	models.QueryAreaInfo()
}

func TestQueryStationInfo(t *testing.T) {
	stations, _ := models.QueryStationInfo()
	for i := 0; i < len(stations); i++ {
		beego.Info(stations[i].Id, stations[i].Code, stations[i].Name)
	}
}*/

/*func TestGetAQIDetailsByCity(t *testing.T) {
	pollutions, _ := models.GetAQIDetailsByCity("hangzhou")
	for i := 0; i < len(pollutions); i++ {
		beego.Info(pollutions[i])
	}
}*/

/*func TestQueryPollutionInfo(t *testing.T) {
	monitorPollutions, _ := models.QueryPollutionInfo(time.Date(2017, 2, 9, 17, 0, 0, 0, time.UTC), time.Date(2017, 2, 9, 17, 0, 0, 0, time.UTC))
	for i := 0; i < len(monitorPollutions); i++ {
		beego.Info(monitorPollutions[i].Aqi, monitorPollutions[i].Time, monitorPollutions[i].MonitorStation, monitorPollutions[i].MonitorArea)
	}
}

func TestQueryPollutionInfoByStation(t *testing.T) {
	monitorPollutions, _ := models.QueryPollutionInfoByStation(1, time.Date(2017, 2, 9, 15, 0, 0, 0, time.UTC), time.Date(2017, 2, 9, 17, 0, 0, 0, time.UTC))
	for i := 0; i < len(monitorPollutions); i++ {
		beego.Info(monitorPollutions[i].Aqi, monitorPollutions[i].Time, monitorPollutions[i].MonitorStation, monitorPollutions[i].MonitorArea)
	}
}*/

func TestClearRestCache(t *testing.T) {
	clearRestCacheResp, err := models.ClearRestCache("dev", "PollutionStation", "MapServer")
	beego.Info(clearRestCacheResp, err)

}
