/** @jsxRuntime classic */
/** @jsx jsx */

import { Card, jsx, useThemeUI } from "theme-ui";
import { max } from "lodash";
import { ResponsiveLine, Serie, CustomLayerProps } from "@nivo/line";
import { Score } from "../models/score";
import { HighlightLine } from "./HighlightLine";
import { LineSymbol } from "./LineSymbol";
import { getIsPositive, setOpacity } from "../util/util";
import { Team } from "../models/team";

interface ScoreLineProps {
  data: Serie[];
  scoreData: Score[];
  isTeam1: boolean;
  team1: Team;
  team2: Team;
  overrideIndex: number | undefined;
  setIndex(index: number | undefined): void;
  onAnimationEnd: () => void;
}

const getMax = (data: Serie[]) => {
  if (data.length === 0) {
    return 5.0;
  }
  const m = max(data[0].data.map((d) => d.x)) as number;
  const val = m > 5.0 ? m : 5.0;
  return val;
};

export const ScoreLine: React.FC<ScoreLineProps> = ({
  data,
  scoreData,
  overrideIndex,
  setIndex,
  isTeam1,
  team1,
  team2,
  onAnimationEnd,
}) => {
  const { theme } = useThemeUI();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderTick = (tickData: any) => {
    let labelVal = "";
    if (
      tickData.value === 5 &&
      data?.length > 0 &&
      max(data[0].data.map((d) => d.x)) >= 5
    ) {
      labelVal = "OT";
    } else if (tickData.value < 5) {
      labelVal = tickData.value.toString();
    }
    return (
      <text
        dominantBaseline={tickData.textBaseline}
        textAnchor={tickData.textAnchor}
        transform={`translate(${tickData.x},${tickData.textY}) rotate(0)`}
        style={{
          fontFamily: "sans-serif",
          fontSize: 11,
          fill: theme.colors?.text,
        }}
      >
        {labelVal}
      </text>
    );
  };

  const catmull = true;

  const LineWrapper: React.FC<CustomLayerProps> = (props) => (
    <HighlightLine
      mode={catmull ? "catmullRom" : "linear"}
      onAnimationEnd={onAnimationEnd}
      {...props}
    />
  );

  return (
    <Card
      sx={{
        width: "100%",
        height: "100%",
      }}
    >
      <ResponsiveLine
        data={data}
        key="line"
        curve={catmull ? "catmullRom" : "linear"}
        margin={{
          right: 50,
          top: 25,
          bottom: 50,
          left: 50,
        }}
        xScale={{ type: "linear", min: 1, max: getMax(data) }}
        yScale={{
          type: "linear",
          min: "auto",
          max: "auto",
          stacked: false,
          reverse: false,
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          orient: "bottom",
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Quarter",
          legendOffset: 36,
          legendPosition: "middle",
          tickValues: Math.round(getMax(data)),
          renderTick,
        }}
        axisLeft={{
          orient: "left",
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Score",
          legendOffset: -40,
          legendPosition: "middle",
        }}
        markers={[{ axis: "y", value: 0 }]}
        pointSize={10}
        pointColor={{ theme: "background" }}
        pointBorderWidth={2}
        pointBorderColor={{ from: "serieColor" }}
        pointLabel="y"
        pointLabelYOffset={-12}
        enableSlices={false}
        pointSymbol={(props) => (
          <LineSymbol {...props} data={data} overrideIndex={overrideIndex} />
        )}
        useMesh
        layers={[
          "grid",
          "markers",
          "axes",
          "areas",
          "crosshair",
          LineWrapper,
          "points",
          "slices",
          "mesh",
          "legends",
        ]}
        theme={{
          background: theme.colors?.background,
          textColor: theme.colors?.text,
          crosshair: { line: { stroke: theme.colors?.text } },
          legends: { text: { fill: theme.colors?.text } },
          grid: { line: { stroke: setOpacity(theme.colors?.text ?? "", 0.2) } },
          markers: { lineColor: setOpacity(theme.colors?.text ?? "", 0.7) },
        }}
        onMouseMove={(point) => {
          setIndex(point.index);
        }}
        onMouseLeave={() => setIndex(undefined)}
        tooltip={({ point }) => {
          const index = parseInt(point.id.split(".")[1], 10);
          const current = scoreData[index];
          const score = isTeam1
            ? current.team1.miseryIndex
            : current.team2.miseryIndex;
          let nextScore = score;
          if (index < scoreData.length - 1) {
            nextScore = isTeam1
              ? scoreData[index + 1].team1.miseryIndex
              : scoreData[index + 1].team2.miseryIndex;
          }
          return (
            <div
              style={{
                background: theme.colors?.secondary,
                borderRadius: 5,
                padding: 5,
                fontSize: 12,
                marginTop: 100,
              }}
            >
              <div>
                {`${team1.originalMascot}: ${
                  (isTeam1 ? current.team1 : current.team2).gameScore
                }`}
              </div>
              <div>
                {`${team2.originalMascot}: ${
                  (isTeam1 ? current.team2 : current.team1).gameScore
                }`}
              </div>
              <div>
                Misery Index:
                <span
                  sx={{
                    color: getIsPositive(score, nextScore)
                      ? "highlightPositive"
                      : "highlightNegative",
                  }}
                >
                  {` ${score}`}
                </span>
              </div>
            </div>
          );
        }}
        legends={[
          {
            data: [],
            anchor: "bottom-right",
            direction: "column",
            justify: false,
            translateX: 100,
            translateY: 0,
            itemsSpacing: 0,
            itemDirection: "left-to-right",
            itemWidth: 80,
            itemHeight: 20,
            itemOpacity: 0.75,
            symbolSize: 12,
            symbolShape: "circle",
            symbolBorderColor: "rgba(0, 0, 0, .5)",
            effects: [
              {
                on: "hover",
                style: {
                  itemBackground: "rgba(0, 0, 0, .03)",
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]}
      />
    </Card>
  );
};
