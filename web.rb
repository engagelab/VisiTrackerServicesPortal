require 'sinatra'
require 'mongoid'
require 'digest'
require 'uri'
require 'json'
require 'fileutils'
require 'aws/s3'
require 'securerandom'
require 'logger'
require 'bcrypt'

class Iobserve < Sinatra::Application
  include BCrypt
  #$log = Logger.new('./logs/output.log')

  #set :environment, :development
  set :environment, :production

  #enable :sessions
  #set :sessions, true
  #set :session_secret, 'super secret'

  # Enable sinatra sessions
  #use Rack::Session::Cookie, :key => '_rack_session',
  #  :expire_after => 60 * 60 * 24,  #expire after 1 day
  #  :secret => 'asadbb2342923222f1adc05c834fa234230e3494b93824b10e930bb0fb89b'

  configure do
    set :app_file, __FILE__
    Mongoid.load! "#{File.dirname(__FILE__)}/config/mongoid.yml"
    #$log.level = Logger::DEBUG
  end

  configure :development do
    enable :logging, :dump_errors, :raise_errors
  end

  configure :qa do
    enable :logging, :dump_errors, :raise_errors
  end

  configure :production do
    set :raise_errors, false #false will show nicer error page
    set :show_exceptions, false #true will ignore raise_errors and display backtrace in browser
  end

  helpers do
    def authorized?
      thetoken = params[:token]
      token = Token.find_by(token: thetoken)
      if token and token.expires_on >= Time.now.to_i
        return true
      end
      return false
    end
  end

  get '/' do
    send_file File.join('public', 'index.html')
  end

  get '/api' do
    if login?
      send_file File.join('public/api', 'index.html')
    end
  end
end

require_relative 'routes/init'
require_relative 'models/init'