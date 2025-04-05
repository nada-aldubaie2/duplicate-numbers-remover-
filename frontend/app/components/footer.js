'use client'
import Link from "next/link";

export default function Footer(){
    return(
        <footer className=" text-gray-500 py-4 text-center">
            <div className="container mx-auto text-base">
              <p className="mb-2">
                Developed by &nbsp;
                <Link
                  href="https://www.linkedin.com/in/nada-aldubaie%F0%9F%AA%84-3a3a96238?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-cyan-600 hover:text-cyan-400 transition-colors"
                >
                  Nada Aldubaie
                </Link>
              </p>
              <p className="text-sm">
                © {new Date().getFullYear()}  All rights reserved.
              </p>
            </div>
          </footer>
    );
}