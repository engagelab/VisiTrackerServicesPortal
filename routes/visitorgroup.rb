class Iobserve < Sinatra::Application
  ######################## Visitorgroup ##################################

  ### list all events from all sessions by space id and room id  for portal
  get '/portal/space/:space_id/:room_id/session/visitorgroupbysize' do
    if authorized?
      content_type :json
      sessions = Sessionob.where(:room_id => params[:room_id]).in(:space_ids => params[:space_id])

      groupofone = 0
      groupoftwo = 0
      groupofthree = 0
      groupoffour = 0

      unless sessions.nil?
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
      [{"label" => "Group of 1", "value" => groupofone}, {"label" => "Group of 2", "value" => groupoftwo}, {"label" => "Group of 3", "value" => groupofthree}, {"label" => "Group of 4","value" => groupoffour}].to_json
    else
      status 401
    end
  end


  ### update visitorgroup's properties
  put '/visitorgroup' do
    request.body.rewind  # in case someone already read it
    content_type :json;
    data = JSON.parse request.body.read

    unless data.nil? or data['_id'].nil?
      status 200

      visitorgroup = Visitorgroup.find(data['_id'])

      unless data['comment'].nil?
        visitorgroup.update_attributes(:comment => data['comment'])
      end

      unless data['consent'].nil?
        visitorgroup.update_attributes(:consent => data['consent'])
      end

      visitorgroup.save;
      visitorgroup.to_json;
    else
      status 404
      {"message" => "Provide comment"}.to_json
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
