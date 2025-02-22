"use client";
import type { Item } from "@/types";
import {
  Box,
  Button,
  Flex,
  MantineProvider,
  NumberFormatter,
  Text,
} from "@mantine/core";
import { useRef } from "react";
import Barcode from "react-barcode";
import { createRoot } from "react-dom/client";

export default function BarcodePrintView(props?: { item?: Item,rate:number }) {
  const barcodeRef = useRef<HTMLDivElement>(null);

  const handleOpenPopup = () => {
    const popup = window.open("", "Barcode Print", "width=auto,height=auto");
    if (popup) {
      popup.document.write(`
          <html>
            <head>
              <title>Barcode Print</title>
              <style>
                * {
                  margin: 0;
                  padding: 0;
                  font-family: "Arial", sans-serif;
                  text-align: center;
                }

                body {
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  background-color: white;
                  margin: 0;
                }

                #print-body {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  padding: 0px;
                  gap:0;
                }

                h3 {
                  font-size: 12px;
                 
                }

                @media print {
                  html, body {
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                    
                  }

                  h3 {
                    font-size: 8px;
                    
                  }

                  h3:first-child {
                    margin-top: 9px;
                    text-align: start;
                    margin-left: 5px;
                    font-size: 10px;
                  }
                }
              </style>
            </head>
            <body>
              <div id="root-print"></div>
            </body>
          </html>
        `);
      const root = popup.document.getElementById("root-print");
      const renderRoot = createRoot(root!);
      renderRoot.render(
        <MantineProvider defaultColorScheme="light" forceColorScheme="light">
          <div id="print-body">
            <h3>
              {props?.item?.name} - $
              <NumberFormatter value={props?.item?.sell} thousandSeparator />
              - <NumberFormatter value={(props?.item?.sell??1) * (props?.rate??1)} thousandSeparator />ل.ل
            </h3>
            <Barcode
              value={props?.item?.serialNumber ?? ""}
              width={1}
              height={20}
              fontSize={10}
            />
            <h3>موئسسة تولين للتجارة العامة 03/876331</h3>
          </div>
        </MantineProvider>
      );
      setTimeout(() => {
        popup.print();
        popup.close();
      }, 500);
      popup.document.close();
    }
  };

  return (
    <>
      {props?.item?.serialNumber ? (
        <>
          <Box
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Box
              ref={barcodeRef}
              style={{
                width: "auto",
                height: "auto",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#fff",
                padding: "10px",
              }}
            >
              <Text size="xs">
                {props?.item?.name} - $
                <NumberFormatter value={props?.item?.sell} thousandSeparator />
              </Text>
              <Barcode
                value={props?.item?.serialNumber ?? ""}
                width={2}
                height={60}
                fontSize={12}
                margin={5}
                textMargin={0}
              />
            </Box>
          </Box>
          <Flex justify="center" mt="md" align="center" direction="column">
            <Button onClick={handleOpenPopup} mt="md">
              Print
            </Button>
          </Flex>
        </>
      ) : (
        <Text>No BarCode</Text>
      )}
    </>
  );
}
