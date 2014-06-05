class Iobserve < Sinatra::Application
  ######################## Action ##################################
  ### create an artefact
  post '/artefact' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      bdy = request.body.read

      if bdy.length > 2 then
        data = JSON.parse bdy
      else
        halt 404
        return {"message" => "Error: provide a valid JSON"}.to_json
      end

      unless data.nil? or data['type'].nil? then
        newtype = data['type'].upcase

        if Artefact.where({ :type => newtype }).count  == 0 then
          status 200
          artefact = Artefact.create(:type => newtype)
          return  artefact.to_json
        else
          status 202
          return Artefact.where({ :type => newtype }).to_json
        end
      else
        status 404
        return {"message" => "Error: provide a valid type"}.to_json
      end
    else
      status 401
    end
  end


  ### list all artefacts
  get '/artefact' do
    if authorized?
      content_type :json
      @artefact = Artefact.order_by(:type.asc).all()
      return @artefact.to_json
    else
      status 401
    end
  end

  ###  get a artefact by id
  get '/artefact/:artefact_id' do
    if authorized?
      content_type :json
      artefact = Artefact.find(params[:artefact_id])
      return artefact.to_json
    else
      status 401
    end
  end


  ### update artefact's properties
  put '/artefact' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json;
      bdy = request.body.read

      if bdy.length > 2 then
        data = JSON.parse bdy
      else
        halt 404
        return {"message" => "Error: provide a valid JSON"}.to_json
      end

      unless data.nil? or data['type'].nil? or Artefact.where({ :type => data['type'].upcase }).count > 0 then
        status 200

        artefact = Artefact.find(data['_id'])
        artefact.update_attributes(:type => data['type'].upcase)

        return artefact.to_json
      else
        status 404
        return {"message" => "Provide a new type"}.to_json
      end
    else
      status 401
    end
  end

  ### delete an artefact by id
  delete '/artefact/:artefact_id' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      artefact = Artefact.find(params[:artefact_id])

      if artefact.nil? then
        status 404
      else
        if artefact.destroy then
          status 200
          return {"message" => "Artefact deleted"}.to_json
        else
          status 500
        end
      end
    else
      status 401
    end
  end
end
