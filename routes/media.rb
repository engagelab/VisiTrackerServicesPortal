class Iobserve < Sinatra::Application
  ######################## Media ##################################
  ### create a media by session id
  post '/session/:session_id/media' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json
      data = JSON.parse request.body.read

      unless data.nil? or (data['uri'].nil? and data['content_type']) then
        sessionob = Sessionob.find(params[:session_id])
        unless sessionob.nil? then
          status 200
          media = Media.create(:uri => data['uri'], :content_type => data['content_type'], :created_on => Time.now.to_i)
          sessionob.medias << media
          sessionob.save
          return sessionob.medias.to_json
        else
          status 404
          return {"message" => "Error: session not found"}.to_json
        end
      else
        status 404
        return {"message" => "Error: provide a valid label"}.to_json
      end
    else
      status 401
    end
  end


  ### list all medias by session id
  get '/session/:session_id/media' do
    if authorized?
      content_type :json

      sessionob = Sessionob.find(params[:session_id])
      unless sessionob.nil? then
        status 200
        return sessionob.medias.to_json
      else
        status 404
        return {"message" => "Error: session not found"}.to_json
      end
    else
      status 401
    end
  end


  ### list all medias
  get '/media' do
    if authorized?
      content_type :json
      @media = Media.all()
      return @media.to_json
    else
      status 401
    end
  end

  ###  get a media by id
  get '/media/:media_id' do
    if authorized?
      content_type :json
      media = Media.find(params[:media_id])
      return media.to_json
    else
      status 401
    end
  end


  ### update media's properties
  put '/media' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json;
      data = JSON.parse request.body.read

      unless data.nil? or data['_id'].nil? then
        status 200

        media = Media.find(data['_id'])

        unless data['uri'].nil?
          media.update_attributes(:uri => data['uri'])
        end

        unless data['content_type'].nil?
          media.update_attributes(:content_type => data['content_type'])
        end

        return media.to_json
      else
        status 404
        return {"message" => "Provide uri and/or content_type"}.to_json
      end
    else
      status 401
    end
  end

  ### delete a media by id
  delete '/media/:media_id' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      media = Media.find(params[:media_id])

      eventob = Eventob.find(media.eventob_id)
      eventob.medias.delete(media)


      if media.nil? then
        status 404
      else
        if media.destroy then
          status 200
          return {"message" => "Media deleted"}.to_json
        else
          status 500
        end
      end
    else
      status 401
    end
  end
end
