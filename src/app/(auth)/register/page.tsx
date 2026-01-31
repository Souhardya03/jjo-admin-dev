import SignupFormDemo from "@/components/signup-form-demo";
import Image from "next/image";
import React from "react";

const Page = () => {
    return (
        <div className="flex items-center lg:flex-row lg:m-0  m-4 flex-col  lg:justify-evenly min-h-screen overflow-hidden">
            <div className="flex relative   flex-col md:mb-14 mb-0   items-center justify-center gap-4">
                <div className="md:w-48 md:h-48 lg:w-96 lg:h-96 flex items-center justify-center">
                    <Image
                        src={"/images/JJOLogo.png"}
                        height={300}
                        width={300}
                        alt="JJO Logo"
                    />
                </div>
                <h2 className="text-3xl text-[#303030] lg:absolute bottom-1 mb-10 md:mb-0 font-bold  text-center ">
                    Welcome to JJO Admin
                </h2>
            </div>

            <SignupFormDemo />
        </div>
    );
};

export default Page;
