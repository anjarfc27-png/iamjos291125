import Link from "next/link";

export default function AuthCodeErrorPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 text-center">
                <div>
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
                        Authentication Error
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        There was a problem verifying your email link.
                    </p>
                </div>

                <div className="rounded-md bg-red-50 p-4 text-left">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">
                                Possible causes:
                            </h3>
                            <ul className="mt-2 list-disc pl-5 text-sm text-red-700 space-y-1">
                                <li>The link has expired.</li>
                                <li>The link has already been used.</li>
                                <li>The link was malformed.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <p className="text-sm text-gray-500">
                        Please try signing in (your account might already be active) or request a new confirmation email.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link
                            href="/login"
                            className="rounded-md bg-[#006798] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#005a87] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006798]"
                        >
                            Go to Login
                        </Link>
                        <Link
                            href="/"
                            className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
