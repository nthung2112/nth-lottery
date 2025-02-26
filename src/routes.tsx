import { createBrowserRouter } from "react-router-dom";
import { Layout } from "@/components/layout";

import Home from "@/pages/home/home";
import Config from "@/pages/config/config";

import PersonAll from "@/pages/config/person/person-all";
import PersonAlready from "@/pages/config/person/person-already";

import PrizeConfig from "@/pages/config/prize/prize";

import FaceConfig from "@/pages/config/global/interface";
import ImageConfig from "@/pages/config/global/image";
import MusicConfig from "@/pages/config/global/music";

import Readme from "@/pages/config/readme/readme";

export const configRoutes: any = {
  path: "config",
  Component: Config,
  children: [
    {
      path: "",
      index: true,
      Component: FaceConfig,
      meta: {
        title: "Global config",
        icon: "config",
      },
    },
    {
      path: "person",
      meta: {
        title: "User config",
        icon: "person",
      },
      children: [
        {
          path: "all",
          Component: PersonAll,
          meta: {
            title: "Person list",
            icon: "all",
          },
        },
        {
          path: "already",
          Component: PersonAlready,
          meta: {
            title: "Winner list",
            icon: "already",
          },
        },
      ],
    },
    {
      path: "prize",
      Component: PrizeConfig,
      meta: {
        title: "Prize config",
        icon: "prize",
      },
    },
    {
      path: "global",
      meta: {
        title: "Addition config",
        icon: "global",
      },
      children: [
        {
          path: "image",
          Component: ImageConfig,
          meta: {
            title: "Image list",
            icon: "image",
          },
        },
        {
          path: "music",
          Component: MusicConfig,
          meta: {
            title: "Music list",
            icon: "music",
          },
        },
      ],
    },
    {
      path: "readme",
      Component: Readme,
      meta: {
        title: "User Guide",
        icon: "readme",
      },
    },
  ],
};

export const routers = createBrowserRouter([
  {
    Component: Layout,
    children: [
      {
        path: "",
        Component: Home,
      },
      configRoutes,
    ],
  },
]);
