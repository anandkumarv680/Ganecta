const Hero = () => {
  return (
    <section className="min-h-[85vh] bg-gray-950 text-white flex items-center">
      <div className="container mx-auto px-4 text-center">

        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          Connect. Build. <span className="text-purple-500">Grow.</span>
        </h1>

        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-8">
          Join a community of developers, showcase your projects,
          participate in coding challenges, and grow together.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-lg font-semibold transition">
            Get Started
          </button>

          <button className="border border-gray-600 hover:border-purple-500 px-8 py-3 rounded-lg font-semibold transition">
            Explore Developers
          </button>
        </div>

      </div>
    </section>
  )
}

export default Hero