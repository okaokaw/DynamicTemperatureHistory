import requests
import json
import random
import calendar
import time
#                1    2   3   4   5   6  7   8   9   10  11  12
per_month_end = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

# 设置本地http代理
proxies = {
    'http': 'http://127.0.0.1:1087',
    'https': 'http://127.0.0.1:1087'
}

user_agents = ['Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36 OPR/26.0.1656.60',
              'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:34.0) Gecko/20100101 Firefox/34.0',
              'Mozilla/5.0 (X11; U; Linux x86_64; zh-CN; rv:1.9.2.10) Gecko/20100922 Ubuntu/10.10 (maverick) Firefox/3.6.10',
              'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/534.57.2 (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2 ',
              'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36',
              'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11',
              'Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US) AppleWebKit/534.16 (KHTML, like Gecko) Chrome/10.0.648.133 Safari/534.16',
              'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/536.11 (KHTML, like Gecko) Chrome/20.0.1132.11 TaoBrowser/2.0 Safari/536.11',
              'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/21.0.1180.71 Safari/537.1 LBBROWSER',
              'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; .NET4.0E; LBBROWSER) ',
              'Mozilla/5.0 (compatible; MSIE 9.0; Windows Phone OS 7.5; Trident/5.0; IEMobile/9.0; HTC; Titan)',
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36']


def read_json(filename):
    with open(filename, 'r') as f:
        return json.load(f)


def save_json(filename, data):
    with open(filename, 'w') as f:
        json.dump(data, f)


def get_json(url, datatype):
    # 模拟浏览器headers
    headers = {
        'referer': 'https://www.wunderground.com/history/monthly/cn/chongqing/ZUCK/date/2018-12',
        'user-agent': random.choice(user_agents)}

    try:
        r = requests.get(url, proxies=proxies, headers=headers)  # 先请求.看请求是否成功.
        if r.status_code == 200:  # 请求成功时

            json_data = r.json()['history'][datatype]

            return json_data

    except requests.ConnectionError as e:
        print('Error', e.args)


def get_all_month(year):
    per_month_end[1] = calendar.monthrange(year, 2)[1]
    for i in range(0, 12):
        month = i + 1
        # WeatherUnderground Chongqing
        url = "https://api-ak.wunderground.com/api/d8585d80376a429e/history_{y}{m}01{y}{m}{end}/lang:EN/units:metric/bestfct:1/v:2.0/q/ZUCK.json?showObs=0&ttl=120"\
            .format(y=year, m=str(month).zfill(2), end=per_month_end[i])

        json_days = get_json(url, 'days')

        # 加个检查
        if (len(json_days) != per_month_end[i]):
            print("{0}年{1}月JSON数据有误".format(year, month))

        save_json("./days_raw_json/days_raw_json_{0}-{1}.json".format(year, month), get_json(url, 'days'))

        time.sleep(random.randint(3, 5))


def get_month_summary(year):
    for i in range(0, 12):
        month = i + 1
        # WeatherUnderground Chongqing
        url = "https://api-ak.wunderground.com/api/d8585d80376a429e/history_{y}{m}01{y}{m}{end}/lang:EN/units:metric/bestfct:1/v:2.0/q/ZUCK.json?showObs=0&ttl=120"\
            .format(y=year, m=str(month).zfill(2), end=per_month_end[i])

        save_json("./month_raw_json/raw_month_summary_{0}-{1}.json".format(year, month), get_json(url, 'summary'))

        time.sleep(random.randint(3, 5))


def process_raw_json(year, datatype):
    # json清洗 （一年一json?）
    t_year = []

    for i in range(0, 12):
        month = i + 1

        if (datatype == 'days'):

            json_days = read_json("./days_raw_json/days_raw_json_{0}-{1}.json".format(year, month))
            for day in json_days:
                day = day['summary']
                date_j = day['date']
                date = str(date_j['year']) + "-" + str(date_j['month']).zfill(2) + "-" + str(date_j['day']).zfill(2)
                temp = day['temperature']
                precip = day['precip']
                t_year.append({'date': date, "temp": temp, "precip": precip})
            save_json("./year_day_json/year_json_{0}.json".format(year), t_year)


        if (datatype == 'month'):

            json_month = read_json("./month_raw_json/raw_month_summary_{0}-{1}.json".format(year, month))
            temp = json_month['temperature_avg']
            precip_sum = json_month['precip_sum']
            t_year.append({'month': month, "temp": temp, "precip_sum": precip_sum})
            save_json("./year_month_json/month_summary_json_{0}.json".format(year), t_year)


if __name__ == "__main__":

    '''
    # 爬raw json
    for i in range(2018, 2017, -1):
        get_all_month(i)
        time.sleep(random.randint(0, 3))

    for i in range(2007, 2001, -1):
        get_month_summary(i)
        time.sleep(random.randint(0, 3))
    '''

    # 数据清洗
    for i in range(2018, 2001, -1):
        process_raw_json(i, 'month')





