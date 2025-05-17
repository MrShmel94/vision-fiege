"use client";
import React from "react";
import { Box, Card, CardContent, Typography, Button, Backdrop } from "@mui/material";
import { useAppContext } from "../../AppContext";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import errorAnim from "../../resources/error_red.json";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const ErrorOverlay = () => {
  const { errorOverlay, setErrorOverlay } = useAppContext();

  return (
    <AnimatePresence>
      {errorOverlay.open && (
        <Backdrop
          open={true}
          sx={{ zIndex: 9999, backdropFilter: "blur(8px)", color: "#fff" }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
          >
            <Box sx={{ width: 400, mb: 2 }}>
              <Lottie animationData={errorAnim} loop autoplay />
            </Box>
            <Card
              sx={{
                minWidth: 320,
                backgroundColor: "#fff",
                color: "#000",
                borderRadius: 4,
                p: 2,
                boxShadow: 8,
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>Oops, something went wrong</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>{errorOverlay.message}</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setErrorOverlay({ open: false, message: "" })}
                  fullWidth
                >
                  Try again
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </Backdrop>
      )}
    </AnimatePresence>
  );
};

export default ErrorOverlay;