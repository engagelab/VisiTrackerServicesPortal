class Iobserve < Sinatra::Application
  include BCrypt

  SESSION_PERIOD = 86400 #Token expires 24hrs from now  = 86400
  SESSION_EXPIRY_WINDOW = 175

#  Use this to save lines!
#  before do
#    request.body.rewind
#    @request_payload = JSON.parse request.body.read
#  end

  ######################## User ##################################
  ### get all users
  get '/user' do
    if authorized?
      content_type :json
      @user = User.without(:password_hash, :password_salt).all()
      return @user.to_json
    else
      status 401
    end
  end

  ### get user by id
  get '/user/:id' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      user = User.without(:password_hash, :password_salt).find(params[:id])

      if user.nil? then
        status 404
      else
        status 200
        return user.to_json
      end
    else
      status 401
    end
  end



  #!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  ######  Note that this call transmits password back to the user to enable auto-login after register.  requires review. ######
  #!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  ### create a user aka 'register'
  post '/user' do
    request.body.rewind  # in case someone already read it
    content_type :json

    bdy = request.body.read

    if bdy.length <= 2 then
      status 401
      return {"message" => "Insufficient data"}.to_json
    end

    data = JSON.parse bdy

    unless data.nil? or (data['last_name'].nil? and data['first_name'].nil? and data['email'].nil?) then
      status 200

      if data['email'].nil?
        status 401
        return {"message" => "Email required"}.to_json
      else
        email = data['email']
      end

      if data['password'].nil?
        status 401
        return {"message" => "Password required"}.to_json
      end

      # Check for an existing user in the DB
      existing_email = User.where(:email => email).first()

      if existing_email.nil? then
        password_salt = BCrypt::Engine.generate_salt
        password_hash = BCrypt::Engine.hash_secret(data['password'], password_salt)
        user = User.create(
            :last_name => data['last_name'],
            :first_name => data['first_name'],
            :email => data['email'],
            :password_hash => password_hash,
            :password_salt => password_salt,
            :created_on => Time.now.to_i)

        #user.to_json # Does not allow exclusion of password fields!
        {
            "created_on" => user.created_on,
            "email" => user.email,
            "first_name" => user.first_name,
            "last_name" => user.last_name,
            "password" => data['password']
        }.to_json
      else
        status 401
        return {"message" => "User(email) and/or login id already exist"}.to_json
      end

    else
      status 401
      return {"message" => "Provide lastname, firstname and email"}.to_json
    end
  end

  ### update user's properties
  put '/user' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json;

      bdy = request.body.read

      if bdy.length > 2 then
        data = JSON.parse bdy
      end

      unless data.nil? or data['_id'].nil? then
        status 200

        user = User.find(data['_id'])

        unless data['last_name'].nil?
          user.update_attributes(:last_name => data['last_name'])
        end

        unless data['first_name'].nil?
          user.update_attributes(:first_name => data['first_name'])
        end

        unless data['email'].nil?
          user.update_attributes(:email => data['email'])
        end

        unless data['password'].nil?
          password_salt = BCrypt::Engine.generate_salt
          password_hash = BCrypt::Engine.hash_secret(data['password'], password_salt)
          user.update_attributes(:password_hash => password_hash)
          user.update_attributes(:password_salt => password_salt)
        end

        {'_id' => user._id}.to_json
      else
        status 404
      end
    else
      status 401
    end
  end

  ### delete a user by id
  delete '/user/:id' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      user = User.find(params[:id])

      if user.nil? then
        status 404
      else
        if user.destroy then
          status 200
          return {"message" => "User deleted"}.to_json
        else
          status 500
        end
      end
    else
      status 401
    end
  end

  get '/renewlogin' do
    if authorized?
      tokenparam = params[:token]
      token = Token.find_by(token: tokenparam)
      startwindow = token.expires_on - SESSION_EXPIRY_WINDOW
      endwindow = token.expires_on
      nowtime = Time.now.to_i
      if nowtime >= startwindow and nowtime < endwindow  # 3 minute (+ 5 sec allowance for latency) (180 seconds) pre-expiry window allowed for renewal. This is matched client side.
        token.update_attributes(:expires_on => Time.now.to_i + SESSION_PERIOD)
        status 200
      else
        status 401
      end
    else
      status 401
    end
  end

  post '/login' do
    request.body.rewind  # in case someone already read it
    content_type :json

    bdy = request.body.read

    if bdy.length >= 2 then
      data = JSON.parse bdy
    else
      halt 404
      return {"message" => "Error: provide a valid JSON"}.to_json
    end

    unless data.nil? and data['email'].nil? and data['password'].nil? then
      user = User.where(:email => data['email']).first()

      if user then
        if user.password_hash == BCrypt::Engine.hash_secret(data['password'], user.password_salt)
          newtoken = SecureRandom.uuid
          tok = Token.create(
              :token => newtoken,
              :expires_on => Time.now.to_i + SESSION_PERIOD)  #Token expires 24hrs from now  = 86400
          cleantokenlist
          status 200
          return {"token" => newtoken, "userId" => user._id, "expire" => tok.expires_on}.to_json
        else
          status 400
          return {"message" => "Error: wrong password"}.to_json
        end
      else
        status 404
        return {"message" => "Error: user not found"}.to_json
      end
    end
  end

  get '/logout' do
    if authorized?
      Token.where(token: params[:token]).delete
      status 200
    else
      status 401
    end
  end

  # Clean out any old (expired) tokens
  def cleantokenlist
    current_time = Time.now.to_i
    Token.where(:expires_on.lt => current_time).delete
  end

end



