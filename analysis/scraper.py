import pandas as pd
import requests
from bs4 import BeautifulSoup
from cssselect import GenericTranslator, SelectorError
from lxml.cssselect import CSSSelector
from lxml import html
import json
import urllib
import time
import os
import random
import sys

outdir = 'data'
base_url = 'https://www.pro-football-reference.com'

if not os.path.exists(outdir):
    os.mkdir(outdir)


def get_data():
    for year in range(1922, 2021):
        for week in range(1, 22):
            url = f'{base_url}/years/{year}/week_{week}.htm'
            try:
                response = requests.get(url)
                soup = BeautifulSoup(response.text, 'html.parser')
                heading = soup.select('div.section_heading')[1] \
                    .select('h2')[0].text
                anchors = [a['href'] for a in soup.find_all(
                    'a', href=True) if a.string == 'Final']

                if len(anchors) == 0 and any(a for a in soup.find_all('a', href=True) if a.string == 'Preview'):
                    print('finished')
                    return

                dfs = None
                try:
                    dfs = [df for df in pd.read_html(
                        url) if df.iloc[0, 0] != 'PassYds' and df.columns[0] != 'Conf']
                except ValueError as e:
                    print(url, e)
                    continue

                for i, df in enumerate(dfs):
                    df2 = df.iloc[:, 0]
                    title = f'{heading}_{"_".join(df2)}.csv'.replace(
                        ' ', '-').replace('/', '|')
                    print(title)
                    df = pd.read_html(base_url + anchors[i])[1]
                    df = df.fillna(method='ffill')
                    df.to_csv(f'{outdir}/{title}')
                    time.sleep(random.random())

            except urllib.error.HTTPError as e:
                if e.getcode() == 404:
                    time.sleep(random.random())
                    continue
                raise


def get_week_names():
    all_weeks = dict()
    for year in range(1922, 2021):
        print(year)
        url = f'{base_url}/years/{year}/week_1.htm'
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')
        sel = CSSSelector('a')
        h = html.fromstring(response.text)
        weeks = {f'{year} Week {r["href"].split("_")[1].replace(".htm", "")}': f'{year} {r.text}' for r in soup.find_all(
            'a', href=True) if f'/years/{year}/week' in r['href']}
        all_weeks = {**all_weeks, **weeks}
    with open('data/weeks.json', 'w') as f:
        f.writelines(json.dumps(all_weeks))


# get_data()
get_week_names()
