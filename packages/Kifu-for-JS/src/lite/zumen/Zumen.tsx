/*
 shogizumen.js ver.20170713
 (c) maasa. | http://www.geocities.jp/ookami_maasa/shogizumen/

 Converted to a React component by na2hiro in 2023 https://kifu-for-js.81.la
*/

import { IPlaceFormat, IStateFormat } from "json-kifu-format/src/Formats";
import React, { CSSProperties, forwardRef, PropsWithChildren, ReactNode /*, SVGTextElementAttributes*/ } from "react";
import { Color, kindToString } from "shogi.js";
import { KanSuuji, scolor, ZenSuuji } from "./lib";
import { Mochigoma } from "./Mochigoma";
import { cellEqual } from "./zumenCompat";

/**
 * TODO: Customize mochigoma display for tsume shogi
 */
interface IProps {
    width?: number;
    height?: number;
    state?: IStateFormat;
    latestMoveTo?: IPlaceFormat;
    players?: [string | undefined, string | undefined];
    style?: CSSProperties;
    ref?: React.Ref<SVGSVGElement>;
}

const Zumen = forwardRef<SVGSVGElement, PropsWithChildren<IProps>>(
    ({ width, height, state, latestMoveTo, children, players, style = {} }, ref) => {
        if (!state) {
            return null;
        }

        const kx = 25;

        const dx = Math.floor(kx * 1.25);
        const dy = Math.floor(kx * 0.75);

        const dp = 1 / 2;

        const lines: ReactNode[] = [];
        Array.from({ length: 9 }, (v, i) => i).forEach((i) => {
            if (i) {
                lines.push(
                    <line
                        key={i + "h"}
                        x1={i * kx + dx + dp / 2}
                        x2={i * kx + dx + dp / 2}
                        y1={dy + dp / 2}
                        y2={dy + kx * 9 + dp / 2}
                        strokeWidth={dp}
                        stroke={scolor}
                    />,
                );
                lines.push(
                    <line
                        key={i + "v"}
                        y1={i * kx + dy + dp / 2}
                        y2={i * kx + dy + dp / 2}
                        x1={dx + dp / 2}
                        x2={dx + kx * 9 + dp / 2}
                        strokeWidth={dp}
                        stroke={scolor}
                    />,
                );
            }
            lines.push(
                <text
                    key={i + "h-num"}
                    x={i * kx + dx + kx / 2}
                    y={dy - kx / 6}
                    fontSize={kx * 0.4}
                    fill={scolor}
                    textAnchor="middle"
                >
                    {ZenSuuji.charAt(8 - i)}
                </text>,
            );
            lines.push(
                <text
                    key={i + "v-num"}
                    x={dx + kx * 9 + kx * 0.35}
                    y={i * kx + dy + kx * 0.6}
                    fontSize={kx * 0.4}
                    fill={scolor}
                    textAnchor="middle"
                >
                    {KanSuuji.charAt(i)}
                </text>,
            );
        });
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="kifuforjs-lite"
                style={{
                    aspectRatio: `${width} / ${height}`,
                    fontFamily: "serif",
                    userSelect: "none",
                    ...style,
                }}
                viewBox={"0 0 " + width + " " + height}
                ref={ref}
            >
                <g>
                    <rect
                        x={dx}
                        y={dy}
                        width={kx * 9 + 1}
                        height={kx * 9 + 1}
                        fill="none"
                        stroke={scolor}
                        strokeWidth={2}
                    />
                    {lines}
                </g>
                <g>
                    {Array.from({ length: 81 }, (v, i) => i).map((i) => {
                        const tgChildren: ReactNode[] = [];
                        let tgTransform: string;
                        const piece = state.board[8 - (i % 9)][Math.floor(i / 9)];
                        if (!("kind" in piece && "color" in piece)) {
                            return null;
                        }
                        const x = (i % 9) * kx + dx + kx / 2 + dp / 2;
                        const y = Math.floor(i / 9) * kx + dy + kx / 2 + dp / 2;

                        let t = kindToString(piece.kind);
                        const textAttributes: /*SVGTextElementAttributes<any>*/ any = {};
                        if (t.length === 2) {
                            // 成X
                            t = t[1];
                            tgChildren.push(
                                <text
                                    key="成"
                                    dy={-kx * 0.09}
                                    fill={scolor}
                                    fontSize={kx * 0.82}
                                    textAnchor="middle"
                                    style={{
                                        ...(cellEqual(i, latestMoveTo)
                                            ? { fontFamily: "sans-serif", fontWeight: "bold" }
                                            : {}),
                                    }}
                                >
                                    成
                                </text>,
                            );

                            textAttributes.dy = kx * (0.32 + 0.41);
                            tgTransform = `translate(${x},${y}) scale(${
                                piece.color === Color.White ? "-1,-0.5" : "1,0.5"
                            })`;
                        } else {
                            textAttributes.dy = kx * 0.32;
                            tgTransform = `translate(${x},${y})${piece.color === Color.White ? " scale(-1,-1)" : ""}`;
                        }
                        if (cellEqual(i, latestMoveTo)) {
                            textAttributes.style = { fontWeight: "bold" };
                            textAttributes.fontFamily = "sans-serif";
                        }

                        tgChildren.push(
                            <text key={i} fill={scolor} textAnchor="middle" fontSize={kx * 0.82} {...textAttributes}>
                                {t}
                            </text>,
                        );

                        return (
                            <g key={i} transform={tgTransform}>
                                {tgChildren}
                            </g>
                        );
                    })}
                </g>
                <Mochigoma v={0} kx={kx} hand={state.hands[0]} name={players?.[0]} />
                <Mochigoma v={1} kx={kx} hand={state.hands[1]} name={players?.[1]} />
                {children}
            </svg>
        );
    },
);

export default Zumen;
