import { createHashRouter } from "react-router-dom";
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
        titleKey: "navigation.globalConfig",
        icon: "config",
      },
    },
    {
      path: "person",
      meta: {
        titleKey: "navigation.userConfig",
        icon: "person",
      },
      children: [
        {
          path: "all",
          Component: PersonAll,
          meta: {
            titleKey: "navigation.personList",
            icon: "all",
          },
        },
        {
          path: "already",
          Component: PersonAlready,
          meta: {
            titleKey: "navigation.winnerList",
            icon: "already",
          },
        },
      ],
    },
    {
      path: "prize",
      Component: PrizeConfig,
      meta: {
        titleKey: "navigation.prizeConfig",
        icon: "prize",
      },
    },
    {
      path: "global",
      meta: {
        titleKey: "navigation.additionalConfig",
        icon: "global",
      },
      children: [
        {
          path: "image",
          Component: ImageConfig,
          meta: {
            titleKey: "navigation.imageList",
            icon: "image",
          },
        },
        {
          path: "music",
          Component: MusicConfig,
          meta: {
            titleKey: "navigation.musicList",
            icon: "music",
          },
        },
      ],
    },
    {
      path: "readme",
      Component: Readme,
      meta: {
        titleKey: "navigation.userGuide",
        icon: "readme",
      },
    },
  ],
};

export const routers = createHashRouter([
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
