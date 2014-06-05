class Iobserve < Sinatra::Application
  ######################## Visitorgroup ##################################
  ### list all visitorgroups by session id
  get '/session/:session_id/visitorgroup' do
    content_type :json

    sessionob = Sessionob.find(params[:session_id])
    unless sessionob.nil? then
      status 200
      return sessionob.visitorgroup.to_json
    else
      status 404
      return {"message" => "Error: session not found"}.to_json
    end
  end

  ### list all visitorgroups
  get '/visitorgroup' do
    content_type :json
    @visitorgroup = Visitorgroup.all()
    return @visitorgroup.to_json
  end

  ###  get a visitorgroup by id
  get '/visitorgroup/:visitorgroup_id' do
    content_type :json
    visitorgroup = Visitorgroup.find(params[:visitorgroup_id])
    return visitorgroup.to_json
  end


  ### list all events from all sessions by space id and room id  for portal
  get '/portal/space/:space_id/:room_id/session/visitorgroupbysize' do
    if authorized?
      content_type :json
      sessions = Sessionob.where(:room_id => params[:room_id]).in(:space_ids => params[:space_id])

      groupofone = 0;
      groupoftwo = 0;
      groupofthree = 0;
      groupoffour = 0;

      unless sessions.nil? then
        sessions.each do |session|
          case (session.visitorgroup.visitors).length
            when 1
              groupofone = groupofone + 1
            when 2
              groupoftwo = groupoftwo + 1
            when 3
              groupofthree = groupofthree + 1
            else
              groupoffour = groupoffour + 1
          end
        end

      end

      status 200
      #return {"groupofone" => groupofone, "groupoftwo" => groupoftwo, "groupofthree" => groupofthree, "groupoffour" => groupoffour}.to_json

      return [{"label" => "Group of 1", "value" => groupofone}, {"label" => "Group of 2", "value" => groupoftwo}, {"label" => "Group of 3", "value" => groupofthree}, {"label" => "Group of 4","value" => groupoffour}].to_json

    else
      status 401
    end
  end


  ### update visitorgroup's properties
  put '/visitorgroup' do
    request.body.rewind  # in case someone already read it
    content_type :json;
    data = JSON.parse request.body.read

    unless data.nil? or data['_id'].nil? then
      status 200

      visitorgroup = Visitorgroup.find(data['_id'])

      unless data['comment'].nil?
        visitorgroup.update_attributes(:comment => data['comment'])
      end

      unless data['consent'].nil?
        visitorgroup.update_attributes(:consent => data['consent'])
      end

      visitorgroup.save;
      return visitorgroup.to_json;
    else
      status 404
      return {"message" => "Provide comment"}.to_json
    end
  end

  ### delete a visitorgroup by id
  delete '/visitorgroup/:visitorgroup_id' do
    request.body.rewind  # in case someone already read it
    content_type :json

    visitorgroup = Visitorgroup.find(params[:visitorgroup_id])

    if visitorgroup.nil? then
      status 404
    else
      if visitorgroup.destroy then
        status 200
        return {"message" => "Visitorgroup deleted"}.to_json
      else
        status 500
      end
    end
  end
end
