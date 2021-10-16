/* eslint-disable @typescript-eslint/no-explicit-any */
// Defind some thing before all test
import { config } from "dotenv";
import React from "react";
import "./proxyFetch";

window.React = React;
(window as any).isTest = true;
config();
