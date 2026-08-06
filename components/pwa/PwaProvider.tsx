"use client";

import {
  createContext,
  useContext,
  ReactNode,
} from "react";

import {
  PwaContextType,
} from "./types";

import {
  usePwa,
} from "./usePwa";


const PwaContext =
  createContext<PwaContextType | null>(null);



type Props = {
  children: ReactNode;
};



export default function PwaProvider({
  children,
}: Props) {


  const pwa =
    usePwa();



  return (

    <PwaContext.Provider
      value={pwa}
    >

      {children}

    </PwaContext.Provider>

  );

}



export function usePwaContext() {

  const context =
    useContext(PwaContext);


  if (!context) {

    throw new Error(
      "usePwaContext must be used inside PwaProvider"
    );

  }


  return context;

}